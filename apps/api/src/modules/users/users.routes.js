'use strict';

const { Router } = require('express');
const { Op } = require('sequelize');
const { requireAuth } = require('../../middleware/auth');
const { User } = require('../../models');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const router = Router();
router.use(requireAuth);

router.get(
  '/search',
  asyncHandler(async (req, res) => {
    const q = String(req.query.q || '').trim();
    if (q.length < 2) return res.json({ status: 'ok', data: [] });

    const users = await User.findAll({
      where: {
        isActive: true,
        id: { [Op.ne]: req.user.id },
        [Op.or]: [{ username: { [Op.iLike]: `%${q}%` } }, { email: { [Op.iLike]: `%${q}%` } }],
      },
      attributes: ['id', 'username', 'profilePicture'],
      limit: 20,
    });
    res.json({ status: 'ok', data: users });
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'username', 'profilePicture', 'createdAt'],
    });
    if (!user) return res.status(404).json({ status: 'error', code: 'NOT_FOUND' });
    res.json({ status: 'ok', data: user });
  }),
);

module.exports = router;
