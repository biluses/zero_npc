'use strict';

const http = require('http');

const { loadEnv } = require('./config/env');
const logger = require('./config/logger');
const { assertDatabaseConnection } = require('./config/database');
const app = require('./app');
const { buildIo } = require('./sockets');

async function main() {
  const env = loadEnv();

  try {
    await assertDatabaseConnection();
  } catch (err) {
    logger.error({ err }, 'Database connection failed');
    process.exit(1);
  }

  const server = http.createServer(app);
  buildIo(server, env.CORS_ORIGIN);

  server.listen(env.APP_PORT, () => {
    logger.info(`API listening on port ${env.APP_PORT}`);
  });

  const shutdown = (signal) => {
    logger.info({ signal }, 'Received shutdown signal');
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('unhandledRejection', (reason) => logger.error({ reason }, 'Unhandled rejection'));
  process.on('uncaughtException', (err) => {
    logger.error({ err }, 'Uncaught exception');
    process.exit(1);
  });
}

main();
