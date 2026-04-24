'use strict';

const rateLimit = require('express-rate-limit');
const { loadEnv } = require('../config/env');

const env = loadEnv();

const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { status: 'error', code: 'TOO_MANY_REQUESTS', message: 'Too many requests' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
  message: { status: 'error', code: 'TOO_MANY_REQUESTS', message: 'Too many auth attempts' },
});

module.exports = { globalLimiter, authLimiter };
