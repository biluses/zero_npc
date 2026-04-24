'use strict';

const express = require('express');
const { Op } = require('sequelize');
const { z } = require('zod');
const { Notification } = require('../../models');
const { requireAuth } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { parsePagination, paginatedResponse } = require('../../utils/pagination');
const { NotFoundError, ForbiddenError } = require('../../utils/errors');

const router = express.Router();
router.use(requireAuth);

const listSchema = {
  query: z.object({
    unread: z.enum(['true', 'false']).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  }),
};
const idParam = { params: z.object({ id: z.string().uuid() }) };

// GET /api/v1/notifications?unread=true|false
router.get('/', validate(listSchema), async (req, res, next) => {
  try {
    const { limit, offset } = parsePagination(req.query);
    const where = { userId: req.user.id };
    if (req.query.unread === 'true') where.readAt = null;
    if (req.query.unread === 'false') where.readAt = { [Op.ne]: null };

    const { rows, count } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    res.json({ status: 'ok', ...paginatedResponse({ rows, count, limit, offset }) });
  } catch (err) { next(err); }
});

// GET /api/v1/notifications/unread-count
router.get('/unread-count', async (req, res, next) => {
  try {
    const count = await Notification.count({
      where: { userId: req.user.id, readAt: null },
    });
    res.json({ status: 'ok', data: { count } });
  } catch (err) { next(err); }
});

// PATCH /api/v1/notifications/:id/read
router.patch('/:id/read', validate(idParam), async (req, res, next) => {
  try {
    const n = await Notification.findByPk(req.params.id);
    if (!n) throw new NotFoundError('Notification not found');
    if (n.userId !== req.user.id) throw new ForbiddenError('Not your notification');
    if (!n.readAt) {
      n.readAt = new Date();
      await n.save();
    }
    res.json({ status: 'ok', data: n });
  } catch (err) { next(err); }
});

// PATCH /api/v1/notifications/read-all
router.patch('/read-all', async (req, res, next) => {
  try {
    const [affected] = await Notification.update(
      { readAt: new Date() },
      { where: { userId: req.user.id, readAt: null } },
    );
    res.json({ status: 'ok', data: { updated: affected } });
  } catch (err) { next(err); }
});

module.exports = router;
