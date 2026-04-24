'use strict';

const express = require('express');
const { z } = require('zod');
const { Policy } = require('../../models');
const { validate } = require('../../middleware/validate');
const { NotFoundError } = require('../../utils/errors');

const router = express.Router();

const typeParam = { params: z.object({ type: z.enum(['privacy', 'cookies', 'terms']) }) };

// GET /api/v1/policies/:type — público (sin requireAuth).
router.get('/:type', validate(typeParam), async (req, res, next) => {
  try {
    const policy = await Policy.findOne({ where: { type: req.params.type } });
    if (!policy) throw new NotFoundError('Policy not found');
    res.json({ status: 'ok', data: policy });
  } catch (err) { next(err); }
});

module.exports = router;
