'use strict';

const { z } = require('zod');
const { TAG_TYPES, SCAN_METHODS } = require('./constants');

const emailSchema = z.string().trim().toLowerCase().email();
const passwordSchema = z.string().min(8).max(128);
const uuidSchema = z.string().uuid();

const tagUidSchema = z
  .string()
  .trim()
  .min(4)
  .max(128)
  .regex(/^[A-Za-z0-9:_-]+$/, 'tagUid must be alphanumeric (plus : _ -)');

const registerTokenSchema = z.object({
  productId: uuidSchema,
  tagUid: tagUidSchema,
  tagType: z.enum(TAG_TYPES).default('nfc'),
  serial: z.string().trim().max(64).optional(),
});

const initiateExchangeSchema = z.object({
  tokenId: uuidSchema,
  recipientId: uuidSchema,
  message: z.string().trim().max(500).optional(),
});

const validateExchangeSchema = z.object({
  tagUid: tagUidSchema,
  scanMethod: z.enum(SCAN_METHODS).default('nfc'),
});

const registerUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: z.string().trim().min(3).max(64).optional(),
});

module.exports = {
  emailSchema,
  passwordSchema,
  uuidSchema,
  tagUidSchema,
  registerTokenSchema,
  initiateExchangeSchema,
  validateExchangeSchema,
  registerUserSchema,
};
