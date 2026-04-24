'use strict';

const { z } = require('zod');

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    APP_PORT: z.coerce.number().int().positive().default(8000),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

    CORS_ORIGIN: z.string().default('http://localhost:3000'),

    DATABASE_URL: z.string().optional(),
    DB_HOST: z.string().default('localhost'),
    DB_PORT: z.coerce.number().default(5432),
    DB_NAME: z.string().default('zero_npc_dev'),
    DB_USER: z.string().default('zero_npc'),
    DB_PASSWORD: z.string().default(''),
    DB_SSL: z
      .string()
      .default('false')
      .transform((v) => v === 'true'),

    JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
    JWT_ACCESS_EXPIRY: z.string().default('15m'),
    JWT_REFRESH_EXPIRY: z.string().default('30d'),

    BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),

    // Email provider - Resend tiene prioridad si RESEND_API_KEY está definida
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().default('Zero NPC <onboarding@resend.dev>'),

    // SMTP (fallback si Resend no está configurado)
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    SMTP_FROM: z.string().optional(),

    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    STRIPE_SUCCESS_URL: z.string().url().default('http://localhost:3000/checkout/success'),
    STRIPE_CANCEL_URL: z.string().url().default('http://localhost:3000/checkout/cancel'),

    UPLOAD_DIR: z.string().default('./uploads'),
    MAX_UPLOAD_MB: z.coerce.number().int().positive().default(8),

    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),

    TOKEN_DAILY_CHARGES: z.coerce.number().int().positive().default(5),
    TOKEN_CHARGE_RESET_HOURS: z.coerce.number().int().positive().default(24),
  })
  .passthrough();

let cached = null;
function loadEnv() {
  if (cached) return cached;
  require('dotenv').config();
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}

module.exports = { loadEnv };
