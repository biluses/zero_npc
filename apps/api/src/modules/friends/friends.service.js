'use strict';

const { Op } = require('sequelize');
const { Friendship, User } = require('../../models');
const { sequelize } = require('../../config/database');
const { BadRequestError, NotFoundError, ConflictError } = require('../../utils/errors');
const { createNotification } = require('../../utils/notifications');

const PUBLIC_USER_ATTRS = ['id', 'username', 'firstName', 'lastName', 'profilePicture'];

function ensureNotSelf(currentUserId, targetUserId) {
  if (currentUserId === targetUserId) {
    throw new BadRequestError('No puedes interactuar contigo mismo');
  }
}

async function ensureUserExists(userId) {
  const u = await User.findByPk(userId, { attributes: ['id', 'isActive'] });
  if (!u || !u.isActive) throw new NotFoundError('User not found');
  return u;
}

async function request({ currentUserId, targetUserId }) {
  ensureNotSelf(currentUserId, targetUserId);
  await ensureUserExists(targetUserId);

  return sequelize.transaction(async (t) => {
    // Verifica si ya existe alguna relación entre A→B o B→A
    const existing = await Friendship.findOne({
      where: {
        [Op.or]: [
          { userId: currentUserId, friendId: targetUserId },
          { userId: targetUserId, friendId: currentUserId },
        ],
      },
      transaction: t,
    });
    if (existing) {
      if (existing.status === 'accepted') throw new ConflictError('Ya sois amigos');
      if (existing.status === 'pending') throw new ConflictError('Ya hay una solicitud pendiente');
      if (existing.status === 'blocked') throw new ConflictError('Relación bloqueada');
    }

    const created = await Friendship.create(
      { userId: currentUserId, friendId: targetUserId, status: 'pending' },
      { transaction: t },
    );

    await createNotification({
      userId: targetUserId,
      type: 'friend_request',
      payload: { fromUserId: currentUserId },
      transaction: t,
    });

    return created;
  });
}

async function accept({ currentUserId, requesterId }) {
  ensureNotSelf(currentUserId, requesterId);

  return sequelize.transaction(async (t) => {
    // Pending dirigido requesterId -> currentUserId
    const incoming = await Friendship.findOne({
      where: { userId: requesterId, friendId: currentUserId, status: 'pending' },
      transaction: t,
    });
    if (!incoming) throw new NotFoundError('Solicitud no encontrada');

    incoming.status = 'accepted';
    await incoming.save({ transaction: t });

    // Crea/actualiza la inversa para simetría visual en queries simples
    const inverse = await Friendship.findOne({
      where: { userId: currentUserId, friendId: requesterId },
      transaction: t,
    });
    if (inverse) {
      if (inverse.status !== 'accepted') {
        inverse.status = 'accepted';
        await inverse.save({ transaction: t });
      }
    } else {
      await Friendship.create(
        { userId: currentUserId, friendId: requesterId, status: 'accepted' },
        { transaction: t },
      );
    }

    await createNotification({
      userId: requesterId,
      type: 'friend_accepted',
      payload: { byUserId: currentUserId },
      transaction: t,
    });

    return incoming;
  });
}

async function reject({ currentUserId, requesterId }) {
  ensureNotSelf(currentUserId, requesterId);
  const incoming = await Friendship.findOne({
    where: { userId: requesterId, friendId: currentUserId, status: 'pending' },
  });
  if (!incoming) throw new NotFoundError('Solicitud no encontrada');
  await incoming.destroy();
  return { rejected: true };
}

async function remove({ currentUserId, otherUserId }) {
  ensureNotSelf(currentUserId, otherUserId);
  await Friendship.destroy({
    where: {
      [Op.or]: [
        { userId: currentUserId, friendId: otherUserId },
        { userId: otherUserId, friendId: currentUserId },
      ],
    },
  });
  return { removed: true };
}

async function listFriends({ currentUserId, status = 'accepted', limit, offset }) {
  const { rows, count } = await Friendship.findAndCountAll({
    where: { userId: currentUserId, status },
    include: [{ model: User, as: 'friend', attributes: PUBLIC_USER_ATTRS }],
    order: [['updatedAt', 'DESC']],
    limit,
    offset,
  });
  return {
    rows: rows.map((r) => ({
      id: r.id,
      status: r.status,
      friend: r.friend,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    })),
    count,
  };
}

async function listRequests({ currentUserId, type = 'incoming', limit, offset }) {
  const where = type === 'incoming'
    ? { friendId: currentUserId, status: 'pending' }
    : { userId: currentUserId, status: 'pending' };

  const { rows, count } = await Friendship.findAndCountAll({
    where,
    include: [
      type === 'incoming'
        ? { model: User, as: 'user', attributes: PUBLIC_USER_ATTRS }
        : { model: User, as: 'friend', attributes: PUBLIC_USER_ATTRS },
    ],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  return {
    rows: rows.map((r) => ({
      id: r.id,
      otherUser: type === 'incoming' ? r.user : r.friend,
      createdAt: r.createdAt,
    })),
    count,
  };
}

/**
 * Discover: busca usuarios y para cada uno indica el campo `relationship`:
 * none | pending_outgoing | pending_incoming | accepted | blocked
 */
async function discover({ currentUserId, q, limit, offset }) {
  const where = {
    id: { [Op.ne]: currentUserId },
    isActive: true,
  };
  if (q && q.length >= 2) {
    where[Op.or] = [
      { username: { [Op.iLike]: `%${q}%` } },
      { firstName: { [Op.iLike]: `%${q}%` } },
      { lastName: { [Op.iLike]: `%${q}%` } },
    ];
  }

  const { rows, count } = await User.findAndCountAll({
    where,
    attributes: PUBLIC_USER_ATTRS,
    order: [['username', 'ASC']],
    limit,
    offset,
  });

  if (!rows.length) return { rows: [], count };

  const ids = rows.map((u) => u.id);
  const links = await Friendship.findAll({
    where: {
      [Op.or]: [
        { userId: currentUserId, friendId: { [Op.in]: ids } },
        { friendId: currentUserId, userId: { [Op.in]: ids } },
      ],
    },
    raw: true,
  });

  function relationFor(otherId) {
    const link = links.find(
      (l) =>
        (l.userId === currentUserId && l.friendId === otherId) ||
        (l.friendId === currentUserId && l.userId === otherId),
    );
    if (!link) return 'none';
    if (link.status === 'accepted') return 'accepted';
    if (link.status === 'blocked') return 'blocked';
    if (link.status === 'pending') {
      return link.userId === currentUserId ? 'pending_outgoing' : 'pending_incoming';
    }
    return 'none';
  }

  const annotated = rows.map((u) => ({ ...u.toJSON(), relationship: relationFor(u.id) }));
  return { rows: annotated, count };
}

module.exports = { request, accept, reject, remove, listFriends, listRequests, discover };
