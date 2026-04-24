'use strict';

const { z } = require('zod');

const initiateExchangeSchema = z.object({
  tokenId: z.string().uuid(),
  recipientId: z.string().uuid(),
  message: z.string().trim().max(500).optional(),
});

const respondExchangeSchema = z.object({
  action: z.enum(['accept', 'reject']),
});

const validateExchangeSchema = z.object({
  tagUid: z.string().trim().min(4).max(128),
  scanMethod: z.enum(['nfc', 'qr']).default('nfc'),
});

module.exports = {
  initiateExchangeSchema,
  respondExchangeSchema,
  validateExchangeSchema,
};
