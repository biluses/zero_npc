'use strict';

const { Router } = require('express');
const { validate: zValidate } = require('../../middleware/validate');
const { requireAuth } = require('../../middleware/auth');
const controller = require('./exchanges.controller');
const schemas = require('./exchanges.schemas');

const router = Router();

router.use(requireAuth);

router.get('/', controller.list);
router.post('/initiate', zValidate({ body: schemas.initiateExchangeSchema }), controller.initiate);
router.post('/:id/respond', zValidate({ body: schemas.respondExchangeSchema }), controller.respond);
router.post('/:id/validate', zValidate({ body: schemas.validateExchangeSchema }), controller.validate);
router.post('/:id/cancel', controller.cancel);

module.exports = router;
