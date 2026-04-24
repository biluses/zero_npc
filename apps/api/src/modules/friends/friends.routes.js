'use strict';

const express = require('express');
const ctrl = require('./friends.controller');
const schemas = require('./friends.schemas');
const { requireAuth } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { friendRequestLimiter } = require('../../middleware/rate-limit');

const router = express.Router();
router.use(requireAuth);

// GET /api/v1/friends?status=accepted|pending&limit&offset
router.get('/', validate(schemas.listFriendsSchema), ctrl.listFriends);

// GET /api/v1/friends/requests?type=incoming|outgoing
router.get('/requests', validate(schemas.requestsSchema), ctrl.listRequests);

// GET /api/v1/friends/discover?q=...
router.get('/discover', validate(schemas.discoverSchema), ctrl.discover);

// POST /api/v1/friends/request/:userId
router.post('/request/:userId', friendRequestLimiter, validate(schemas.userIdParam), ctrl.request);

// POST /api/v1/friends/accept/:userId
router.post('/accept/:userId', validate(schemas.userIdParam), ctrl.accept);

// POST /api/v1/friends/reject/:userId
router.post('/reject/:userId', validate(schemas.userIdParam), ctrl.reject);

// DELETE /api/v1/friends/:userId
router.delete('/:userId', validate(schemas.userIdParam), ctrl.remove);

module.exports = router;
