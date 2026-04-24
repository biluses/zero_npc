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

/**
 * Limiters específicos por acción de usuario autenticado.
 * Key por user.id (cae al IP si no hay user) para que un atacante con muchas
 * cuentas no consuma cuotas globales.
 */
function userKey(req) {
  return req.user?.id || req.ip;
}

const postCreateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: userKey,
  standardHeaders: 'draft-7',
  message: { status: 'error', code: 'TOO_MANY_REQUESTS', message: 'Too many posts created' },
});

const commentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  keyGenerator: userKey,
  standardHeaders: 'draft-7',
  message: { status: 'error', code: 'TOO_MANY_REQUESTS', message: 'Too many comments' },
});

const friendRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: userKey,
  standardHeaders: 'draft-7',
  message: { status: 'error', code: 'TOO_MANY_REQUESTS', message: 'Too many friend requests' },
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: userKey,
  standardHeaders: 'draft-7',
  message: { status: 'error', code: 'TOO_MANY_REQUESTS', message: 'Too many uploads' },
});

module.exports = {
  globalLimiter,
  authLimiter,
  postCreateLimiter,
  commentLimiter,
  friendRequestLimiter,
  uploadLimiter,
};
