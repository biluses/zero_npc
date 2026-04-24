'use strict';

const logger = require('../config/logger');
const { AppError } = require('../utils/errors');
const { loadEnv } = require('../config/env');

const env = loadEnv();

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    logger.warn({ err: { message: err.message, code: err.code }, path: req.path }, 'Operational error');
    return res.status(err.statusCode).json({
      status: 'error',
      code: err.code,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');
  return res.status(500).json({
    status: 'error',
    code: 'INTERNAL_ERROR',
    message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    status: 'error',
    code: 'NOT_FOUND',
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
}

module.exports = { errorHandler, notFoundHandler };
