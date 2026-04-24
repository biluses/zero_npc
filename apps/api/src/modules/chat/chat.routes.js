'use strict';

const { Router } = require('express');
const { z } = require('zod');
const { Op } = require('sequelize');
const { requireAuth } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { ChatMessage, User } = require('../../models');

const router = Router();
router.use(requireAuth);

const sendSchema = z.object({
  recipientId: z.string().uuid(),
  body: z.string().trim().min(1).max(4000),
  messageType: z.enum(['text', 'image', 'exchange']).default('text'),
  exchangeId: z.string().uuid().optional(),
});

const asyncHandler = (fn2) => (req, res, next) => Promise.resolve(fn2(req, res, next)).catch(next);

router.get(
  '/threads',
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const messages = await ChatMessage.findAll({
      where: { [Op.or]: [{ senderId: userId }, { recipientId: userId }] },
      order: [['createdAt', 'DESC']],
      limit: 500,
    });

    const threads = new Map();
    for (const m of messages) {
      const otherId = m.senderId === userId ? m.recipientId : m.senderId;
      if (!threads.has(otherId)) {
        threads.set(otherId, {
          userId: otherId,
          lastMessage: m.body,
          lastMessageAt: m.createdAt,
          unreadCount: 0,
        });
      }
      const t = threads.get(otherId);
      if (m.recipientId === userId && !m.readAt) t.unreadCount += 1;
    }

    const otherIds = Array.from(threads.keys());
    const users = await User.findAll({
      where: { id: otherIds },
      attributes: ['id', 'username', 'profilePicture'],
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const result = Array.from(threads.values()).map((t) => ({
      ...t,
      user: userMap.get(t.userId) || null,
    }));
    res.json({ status: 'ok', data: result });
  }),
);

router.get(
  '/messages/:otherId',
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const otherId = req.params.otherId;
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const before = req.query.before ? new Date(String(req.query.before)) : null;

    const where = {
      [Op.or]: [
        { senderId: userId, recipientId: otherId },
        { senderId: otherId, recipientId: userId },
      ],
    };
    if (before) where.createdAt = { [Op.lt]: before };

    const messages = await ChatMessage.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
    });

    await ChatMessage.update(
      { readAt: new Date() },
      { where: { senderId: otherId, recipientId: userId, readAt: null } },
    );

    res.json({ status: 'ok', data: messages.reverse() });
  }),
);

router.post(
  '/messages',
  validate({ body: sendSchema }),
  asyncHandler(async (req, res) => {
    const { recipientId, body, messageType, exchangeId } = req.body;
    const message = await ChatMessage.create({
      senderId: req.user.id,
      recipientId,
      body,
      messageType,
      exchangeId: exchangeId || null,
      deliveredAt: new Date(),
    });
    const { emitToUser } = require('../../sockets/emitter');
    emitToUser(recipientId, 'chat:new', message.toJSON());
    res.status(201).json({ status: 'ok', data: message });
  }),
);

module.exports = router;
