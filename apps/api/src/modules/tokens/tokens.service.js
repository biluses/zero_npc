'use strict';

const { Token, Product, User } = require('../../models');
const { sequelize } = require('../../config/database');
const {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ForbiddenError,
} = require('../../utils/errors');

/**
 * Registers a new token for a pin or QR product.
 * If the tagUid is unknown, it is associated with the user and the given product.
 * If the tagUid already exists, returns 409 Conflict (to prevent hijacking).
 */
async function registerToken({ user, productId, tagUid, tagType, serial }) {
  return sequelize.transaction(async (tx) => {
    const product = await Product.findByPk(productId, { transaction: tx });
    if (!product || !product.isActive) throw new NotFoundError('Product not found');

    const existing = await Token.findOne({ where: { tagUid }, transaction: tx });
    if (existing) throw new ConflictError('This tag is already registered', { tagUid });

    const token = await Token.create(
      {
        productId: product.id,
        tagUid,
        tagType,
        serial: serial || null,
        originalOwnerId: user.id,
        currentOwnerId: user.id,
        registeredAt: new Date(),
      },
      { transaction: tx },
    );

    return token;
  });
}

/**
 * Looks up a token by its tagUid (scanned value).
 * Used by the scanner flow to identify a pin's product + owner.
 */
async function lookupByTag({ tagUid }) {
  const token = await Token.findOne({
    where: { tagUid },
    include: [
      { model: Product, as: 'product' },
      { model: User, as: 'currentOwner', attributes: ['id', 'username', 'profilePicture'] },
    ],
  });
  if (!token) throw new NotFoundError('Tag not registered');
  return token;
}

async function listMyTokens({ user, limit = 50, offset = 0 }) {
  const { rows, count } = await Token.findAndCountAll({
    where: { currentOwnerId: user.id },
    include: [{ model: Product, as: 'product' }],
    limit: Math.min(limit, 100),
    offset,
    order: [['registeredAt', 'DESC']],
  });
  return { items: rows, total: count };
}

async function getTokenById({ user, id }) {
  const token = await Token.findByPk(id, {
    include: [
      { model: Product, as: 'product' },
      { model: User, as: 'currentOwner', attributes: ['id', 'username', 'profilePicture'] },
    ],
  });
  if (!token) throw new NotFoundError('Token not found');
  if (token.currentOwnerId !== user.id) throw new ForbiddenError('Not your token');
  return token;
}

async function assertUserOwnsToken({ userId, tokenId, tx }) {
  const token = await Token.findByPk(tokenId, { transaction: tx });
  if (!token) throw new NotFoundError('Token not found');
  if (token.currentOwnerId !== userId) throw new ForbiddenError('Not your token');
  if (token.isLocked) throw new BadRequestError('Token is locked in an active exchange');
  return token;
}

module.exports = {
  registerToken,
  lookupByTag,
  listMyTokens,
  getTokenById,
  assertUserOwnsToken,
};
