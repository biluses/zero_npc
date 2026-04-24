'use strict';

/**
 * Setup ejecutado ANTES de cargar app.js / config/env.js.
 * Fija vars de entorno para apuntar a la BD de test.
 */

process.env.NODE_ENV = 'test';
process.env.APP_PORT = process.env.APP_PORT || '8001';
process.env.LOG_LEVEL = 'error';

// Conexión BD test (ignora DATABASE_URL del dev para no tocar dev data).
delete process.env.DATABASE_URL;
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5544';
process.env.DB_NAME = process.env.DB_NAME_TEST || 'zero_npc_test';
process.env.DB_USER = process.env.DB_USER || 'zero_npc';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'zero_npc_dev_password';
process.env.DB_SSL = 'false';

// Secrets mínimos (no tocan prod).
process.env.JWT_ACCESS_SECRET = 'test-access-secret-ultra-seguro-para-jwt-firmas-aaaaaaaaaaaaaaaaaaaaaaaaaaaa';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-ultra-seguro-para-jwt-firmas-bbbbbbbbbbbbbbbbbbbbbbbbbbbb';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '30d';
// Zod env schema exige >=10; no podemos bajar más. Los tests tardan un poco pero cumplen la política.
process.env.BCRYPT_SALT_ROUNDS = '10';

// Secrets de seguridad (fijos para tests, no se comparten con dev/prod).
process.env.PASSWORD_PEPPER = 'test-pepper-secret-at-least-32-chars-long-aaaaaaaaaaaa';
// DATA_ENCRYPTION_KEY: 32 bytes en base64 (44 chars). Generada estática para tests.
process.env.DATA_ENCRYPTION_KEY = 'MTIzNDU2Nzg5MEFCQ0RFRjEyMzQ1Njc4OTBBQkNERUY=';

process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.UPLOAD_DIR = '/tmp/zero-npc-test-uploads';
process.env.MAX_UPLOAD_MB = '5';

process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX = '10000'; // alto para no bloquear tests.

process.env.TOKEN_DAILY_CHARGES = '5';
process.env.TOKEN_CHARGE_RESET_HOURS = '24';
