'use strict';

const { Op } = require('sequelize');
const { Exchange, Token, User, Product } = require('../../models');
const { sequelize } = require('../../config/database');
const tokensService = require('../tokens/tokens.service');
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} = require('../../utils/errors');
const { emitToUser } = require('../../sockets/emitter');
const { loadEnv } = require('../../config/env');

const env = loadEnv();
const EXCHANGE_TTL_MINUTES = 60;

function minutesFromNow(m) {
  return new Date(Date.now() + m * 60 * 1000);
}

async function initiate({ user, tokenId, recipientId, message }) {
  if (recipientId === user.id) throw new BadRequestError('Cannot exchange with yourself');

  return sequelize.transaction(async (tx) => {
    const token = await tokensService.assertUserOwnsToken({ userId: user.id, tokenId, tx });

    const recipient = await User.findByPk(recipientId, { transaction: tx });
    if (!recipient || !recipient.isActive) throw new NotFoundError('Recipient not found');

    const existingPending = await Exchange.findOne({
      where: { tokenId, status: { [Op.in]: ['pending', 'accepted'] } },
      transaction: tx,
    });
    if (existingPending) throw new ConflictError('An active exchange already exists for this token');

    if (user.tokenCharges <= 0) {
      throw new BadRequestError('Not enough token charges to initiate an exchange');
    }

    token.isLocked = true;
    await token.save({ transaction: tx });

    const exchange = await Exchange.create(
      {
        tokenId,
        senderId: user.id,
        recipientId,
        message: message || null,
        status: 'pending',
        expiresAt: minutesFromNow(EXCHANGE_TTL_MINUTES),
      },
      { transaction: tx },
    );

    emitToUser(recipientId, 'exchange:pending', { exchangeId: exchange.id, tokenId, senderId: user.id });
    return exchange;
  });
}

async function respond({ user, exchangeId, action }) {
  return sequelize.transaction(async (tx) => {
    const exchange = await Exchange.findByPk(exchangeId, { transaction: tx });
    if (!exchange) throw new NotFoundError('Exchange not found');
    if (exchange.recipientId !== user.id) throw new ForbiddenError('Not your exchange');
    if (exchange.status !== 'pending') throw new BadRequestError(`Exchange already ${exchange.status}`);
    if (exchange.expiresAt && exchange.expiresAt < new Date()) {
      exchange.status = 'expired';
      await exchange.save({ transaction: tx });
      throw new BadRequestError('Exchange expired');
    }

    if (action === 'accept') {
      exchange.status = 'accepted';
      exchange.acceptedAt = new Date();
    } else {
      exchange.status = 'rejected';
      exchange.rejectedAt = new Date();
      const token = await Token.findByPk(exchange.tokenId, { transaction: tx });
      if (token) {
        token.isLocked = false;
        await token.save({ transaction: tx });
      }
    }
    await exchange.save({ transaction: tx });

    emitToUser(exchange.senderId, `exchange:${exchange.status}`, { exchangeId: exchange.id });
    return exchange;
  });
}

/**
 * Validates an exchange by having the recipient scan the physical tag (NFC or QR).
 * Transfers ownership atomically and increments exchange counters.
 */
async function validate({ user, exchangeId, tagUid, scanMethod }) {
  return sequelize.transaction(async (tx) => {
    const exchange = await Exchange.findByPk(exchangeId, { transaction: tx, lock: tx.LOCK.UPDATE });
    if (!exchange) throw new NotFoundError('Exchange not found');
    if (exchange.recipientId !== user.id) throw new ForbiddenError('Not your exchange');
    if (exchange.status !== 'accepted') throw new BadRequestError(`Exchange is ${exchange.status}`);

    const token = await Token.findByPk(exchange.tokenId, { transaction: tx, lock: tx.LOCK.UPDATE });
    if (!token) throw new NotFoundError('Token not found');
    if (token.tagUid !== tagUid) throw new BadRequestError('Scanned tag does not match the exchange token');

    const sender = await User.findByPk(exchange.senderId, { transaction: tx, lock: tx.LOCK.UPDATE });
    if (!sender) throw new NotFoundError('Sender not found');

    if (sender.tokenCharges <= 0) {
      throw new BadRequestError('Sender has no charges left to complete the exchange');
    }

    token.currentOwnerId = user.id;
    token.exchangeCount += 1;
    token.lastExchangeAt = new Date();
    token.isLocked = false;
    await token.save({ transaction: tx });

    sender.tokenCharges = Math.max(0, sender.tokenCharges - 1);
    await sender.save({ transaction: tx });

    exchange.status = 'validated';
    exchange.validatedAt = new Date();
    exchange.scanMethod = scanMethod;
    await exchange.save({ transaction: tx });

    emitToUser(exchange.senderId, 'exchange:validated', { exchangeId: exchange.id });
    emitToUser(exchange.recipientId, 'exchange:validated', { exchangeId: exchange.id });

    return exchange;
  });
}

async function cancel({ user, exchangeId }) {
  return sequelize.transaction(async (tx) => {
    const exchange = await Exchange.findByPk(exchangeId, { transaction: tx });
    if (!exchange) throw new NotFoundError('Exchange not found');
    if (exchange.senderId !== user.id) throw new ForbiddenError('Only sender can cancel');
    if (!['pending', 'accepted'].includes(exchange.status)) {
      throw new BadRequestError(`Cannot cancel exchange in status ${exchange.status}`);
    }

    exchange.status = 'cancelled';
    exchange.cancelledAt = new Date();
    await exchange.save({ transaction: tx });

    const token = await Token.findByPk(exchange.tokenId, { transaction: tx });
    if (token) {
      token.isLocked = false;
      await token.save({ transaction: tx });
    }

    emitToUser(exchange.recipientId, 'exchange:cancelled', { exchangeId: exchange.id });
    return exchange;
  });
}

async function listForUser({ user, box = 'inbox' }) {
  const where = box === 'outbox' ? { senderId: user.id } : { recipientId: user.id };
  return Exchange.findAll({
    where,
    include: [
      {
        model: Token,
        as: 'token',
        include: [{ model: Product, as: 'product' }],
      },
      { model: User, as: 'sender', attributes: ['id', 'username', 'profilePicture'] },
      { model: User, as: 'recipient', attributes: ['id', 'username', 'profilePicture'] },
    ],
    order: [['createdAt', 'DESC']],
    limit: 100,
  });
}

/**
 * Background-worthy helper: grants daily charges to a user if the last reset
 * was more than TOKEN_CHARGE_RESET_HOURS ago. Safe to call on each login.
 */
async function grantDailyChargesIfDue(user) {
  const now = new Date();
  const hoursSince = user.lastChargeResetAt
    ? (now - user.lastChargeResetAt) / (1000 * 60 * 60)
    : Infinity;
  if (hoursSince >= env.TOKEN_CHARGE_RESET_HOURS) {
    user.tokenCharges = env.TOKEN_DAILY_CHARGES;
    user.lastChargeResetAt = now;
    await user.save();
  }
  return user;
}

module.exports = {
  initiate,
  respond,
  validate,
  cancel,
  listForUser,
  grantDailyChargesIfDue,
};
