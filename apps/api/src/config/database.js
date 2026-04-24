'use strict';

const { Sequelize } = require('sequelize');
const { loadEnv } = require('./env');
const logger = require('./logger');

const env = loadEnv();

function buildSequelize() {
  const opts = {
    dialect: 'postgres',
    logging: env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    define: { underscored: true, timestamps: true },
  };

  if (env.DATABASE_URL) {
    return new Sequelize(env.DATABASE_URL, {
      ...opts,
      dialectOptions: env.DB_SSL ? { ssl: { require: true, rejectUnauthorized: false } } : {},
    });
  }

  return new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
    ...opts,
    host: env.DB_HOST,
    port: env.DB_PORT,
    dialectOptions: env.DB_SSL ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  });
}

const sequelize = buildSequelize();

async function assertDatabaseConnection() {
  await sequelize.authenticate();
  logger.info('Database connection established');
}

module.exports = { sequelize, assertDatabaseConnection };
