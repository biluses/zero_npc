'use strict';

const { Router } = require('express');
const { Op } = require('sequelize');
const { z } = require('zod');
const { requireAuth } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { uploadLimiter } = require('../../middleware/rate-limit');
const upload = require('../../utils/upload');
const { User } = require('../../models');
const { NotFoundError, BadRequestError } = require('../../utils/errors');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const router = Router();
router.use(requireAuth);

const updateMeSchema = {
  body: z.object({
    fullName: z.string().trim().max(120).optional(),
    username: z.string().trim().min(3).max(64).regex(/^[a-zA-Z0-9_.]+$/).optional(),
    addressLine1: z.string().trim().max(160).optional(),
    addressLine2: z.string().trim().max(160).optional(),
    postalCode: z.string().trim().regex(/^\d{4,10}$/).optional(),
    province: z.string().trim().max(80).optional(),
    city: z.string().trim().max(120).optional(),
  }),
};

router.get(
  '/search',
  asyncHandler(async (req, res) => {
    const q = String(req.query.q || '').trim();
    if (q.length < 2) return res.json({ status: 'ok', data: [] });

    const users = await User.findAll({
      where: {
        isActive: true,
        id: { [Op.ne]: req.user.id },
        [Op.or]: [
          { username: { [Op.iLike]: `%${q}%` } },
          { email: { [Op.iLike]: `%${q}%` } },
          { fullName: { [Op.iLike]: `%${q}%` } },
        ],
      },
      attributes: ['id', 'username', 'fullName', 'profilePicture'],
      limit: 20,
    });
    res.json({ status: 'ok', data: users });
  }),
);

// PATCH /api/v1/users/me — actualiza datos de perfil del usuario autenticado.
router.patch(
  '/me',
  validate(updateMeSchema),
  asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id);
    if (!user) throw new NotFoundError('User not found');

    // Si cambia el username, comprobar unicidad.
    if (req.body.username && req.body.username !== user.username) {
      const taken = await User.findOne({
        where: { username: req.body.username, id: { [Op.ne]: user.id } },
      });
      if (taken) throw new BadRequestError('Nombre de usuario en uso');
    }

    Object.assign(user, req.body);
    await user.save();
    res.json({ status: 'ok', data: user.toPublicJSON() });
  }),
);

// POST /api/v1/users/me/avatar — sube imagen y actualiza profilePicture.
router.post(
  '/me/avatar',
  uploadLimiter,
  upload.image('avatar'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new BadRequestError('No file uploaded');
    const { saveUpload } = require('../../utils/upload');
    const url = await saveUpload(req.file.buffer, req.file.mimetype, 'avatars');

    const user = await User.findByPk(req.user.id);
    if (!user) throw new NotFoundError('User not found');
    user.profilePicture = url;
    await user.save();

    res.json({ status: 'ok', data: { user: user.toPublicJSON(), url } });
  }),
);

// GET /api/v1/users/:id — perfil público de otro usuario.
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'username', 'fullName', 'profilePicture', 'createdAt'],
    });
    if (!user) throw new NotFoundError('User not found');
    res.json({ status: 'ok', data: user });
  }),
);

module.exports = router;
