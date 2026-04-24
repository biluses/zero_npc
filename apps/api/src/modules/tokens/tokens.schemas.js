'use strict';

const { z } = require('zod');

const tagUidSchema = z
  .string()
  .trim()
  .min(4)
  .max(128)
  .regex(/^[A-Za-z0-9:_-]+$/, 'tagUid must be alphanumeric (plus : _ -)');

const registerTokenSchema = z.object({
  productId: z.string().uuid(),
  tagUid: tagUidSchema,
  tagType: z.enum(['nfc', 'qr']).default('nfc'),
  serial: z.string().trim().max(64).optional(),
});

const lookupTagSchema = z.object({
  tagUid: tagUidSchema,
});

module.exports = { tagUidSchema, registerTokenSchema, lookupTagSchema };
