'use strict';

const { z } = require('zod');

const emailSchema = z.string().trim().toLowerCase().email();
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long');

const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: z.string().trim().min(3).max(64).optional(),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

const verifyOtpSchema = z.object({
  email: emailSchema,
  otp: z.string().regex(/^\d{4,8}$/),
});

const forgotSchema = z.object({ email: emailSchema });
const resetSchema = z.object({
  email: emailSchema,
  otp: z.string().regex(/^\d{4,8}$/),
  password: passwordSchema,
});

const refreshSchema = z.object({ refreshToken: z.string().min(10) });

module.exports = {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  forgotSchema,
  resetSchema,
  refreshSchema,
};
