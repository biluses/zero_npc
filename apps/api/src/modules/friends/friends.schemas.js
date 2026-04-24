'use strict';

const { z } = require('zod');

const userIdParam = { params: z.object({ userId: z.string().uuid() }) };

const listFriendsSchema = {
  query: z.object({
    status: z.enum(['pending', 'accepted', 'blocked']).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  }),
};

const requestsSchema = {
  query: z.object({
    type: z.enum(['incoming', 'outgoing']).default('incoming'),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  }),
};

const discoverSchema = {
  query: z.object({
    q: z.string().trim().max(120).optional().default(''),
    limit: z.coerce.number().int().min(1).max(50).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  }),
};

module.exports = { userIdParam, listFriendsSchema, requestsSchema, discoverSchema };
