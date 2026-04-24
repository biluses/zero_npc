'use strict';

require('dotenv').config();

const base = {
  client: 'pg',
  migrations: { directory: './migrations', tableName: 'knex_migrations' },
  seeds: { directory: './seeders' },
};

function connectionFromEnv() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    };
  }
  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'zero_npc_dev',
    user: process.env.DB_USER || 'zero_npc',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  };
}

function testConnection() {
  // En test NO usamos DATABASE_URL (que apunta a la BD dev).
  // Forzamos conexión a una BD separada con los mismos credenciales.
  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5544,
    database: process.env.DB_NAME_TEST || 'zero_npc_test',
    user: process.env.DB_USER || 'zero_npc',
    password: process.env.DB_PASSWORD || 'zero_npc_dev_password',
    ssl: false,
  };
}

module.exports = {
  development: { ...base, connection: connectionFromEnv() },
  test: { ...base, connection: testConnection() },
  production: { ...base, connection: connectionFromEnv(), pool: { min: 2, max: 10 } },
};
