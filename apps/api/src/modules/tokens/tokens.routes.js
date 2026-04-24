'use strict';

const { Router } = require('express');
const { validate } = require('../../middleware/validate');
const { requireAuth } = require('../../middleware/auth');
const controller = require('./tokens.controller');
const schemas = require('./tokens.schemas');

const router = Router();

router.use(requireAuth);

router.get('/', controller.list);
router.get('/lookup', validate({ query: schemas.lookupTagSchema }), controller.lookup);
router.get('/:id', controller.byId);
router.post('/register', validate({ body: schemas.registerTokenSchema }), controller.register);

module.exports = router;
