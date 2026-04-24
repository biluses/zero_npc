'use strict';

const pino = require('pino');
const { loadEnv } = require('./env');

const env = loadEnv();

const logger = pino({
  level: env.LOG_LEVEL,
  ...(env.NODE_ENV !== 'production'
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard' },
        },
      }
    : {}),
  redact: {
    paths: [
      'password',
      '*.password',
      '*.*.password',
      'authorization',
      'req.headers.authorization',
      'req.headers.cookie',
      'token',
      '*.token',
      'accessToken',
      'refreshToken',
    ],
    remove: true,
  },
});

module.exports = logger;
