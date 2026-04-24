'use strict';

const { z } = require('zod');

const uuid = z.string().uuid();

const createPostSchema = {
  body: z.object({
    caption: z.string().trim().max(280).default(''),
    withUserId: z.string().uuid().optional().nullable(),
  }),
};

const updatePostSchema = {
  params: z.object({ id: uuid }),
  body: z.object({
    caption: z.string().trim().max(280).optional(),
  }),
};

const idParamSchema = {
  params: z.object({ id: uuid }),
};

const listPostsSchema = {
  query: z.object({
    limit: z.coerce.number().int().min(1).max(100).optional(),
    offset: z.coerce.number().int().min(0).optional(),
    onlyMine: z.enum(['true', 'false']).optional(),
    userId: z.string().uuid().optional(),
  }),
};

const createCommentSchema = {
  params: z.object({ id: uuid }),
  body: z.object({
    comment: z.string().trim().min(1).max(500),
    parentId: z.string().uuid().optional().nullable(),
  }),
};

module.exports = {
  createPostSchema,
  updatePostSchema,
  idParamSchema,
  listPostsSchema,
  createCommentSchema,
};
