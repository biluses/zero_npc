'use strict';

const express = require('express');
const ctrl = require('./posts.controller');
const schemas = require('./posts.schemas');
const { requireAuth } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { postCreateLimiter, commentLimiter, uploadLimiter } = require('../../middleware/rate-limit');
const upload = require('../../utils/upload');

const router = express.Router();

router.use(requireAuth);

// GET /api/v1/posts?limit&offset&onlyMine&userId
router.get('/', validate(schemas.listPostsSchema), ctrl.list);

// GET /api/v1/posts/:id
router.get('/:id', validate(schemas.idParamSchema), ctrl.getOne);

// GET /api/v1/posts/:id/comments
router.get('/:id/comments', validate(schemas.idParamSchema), ctrl.listComments);

// POST /api/v1/posts (multipart: image + caption + withUserId?)
router.post(
  '/',
  postCreateLimiter,
  uploadLimiter,
  upload.image('image'),
  // Multer parsea body desde multipart; validamos después.
  validate(schemas.createPostSchema),
  ctrl.create,
);

// PATCH /api/v1/posts/:id (caption only)
router.patch('/:id', validate(schemas.updatePostSchema), ctrl.update);

// DELETE /api/v1/posts/:id (soft delete)
router.delete('/:id', validate(schemas.idParamSchema), ctrl.remove);

// POST /api/v1/posts/:id/like (toggle)
router.post('/:id/like', validate(schemas.idParamSchema), ctrl.like);

// POST /api/v1/posts/:id/comments
router.post('/:id/comments', commentLimiter, validate(schemas.createCommentSchema), ctrl.addComment);

module.exports = router;
