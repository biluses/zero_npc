'use strict';

const { Router } = require('express');
const { Product, Category } = require('../../models');
const { NotFoundError } = require('../../utils/errors');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const where = { isActive: true };
    if (req.query.categoryId) where.categoryId = String(req.query.categoryId);
    if (req.query.isPin === 'true') where.isPin = true;
    if (req.query.isPin === 'false') where.isPin = false;

    const items = await Product.findAll({
      where,
      include: [{ model: Category, as: 'category' }],
      limit: Math.min(Number(req.query.limit) || 50, 100),
      offset: Number(req.query.offset) || 0,
      order: [['createdAt', 'DESC']],
    });
    res.json({ status: 'ok', data: items });
  }),
);

router.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const items = await Category.findAll({ where: { isActive: true }, order: [['name', 'ASC']] });
    res.json({ status: 'ok', data: items });
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category' }],
    });
    if (!product || !product.isActive) throw new NotFoundError('Product not found');
    res.json({ status: 'ok', data: product });
  }),
);

module.exports = router;
