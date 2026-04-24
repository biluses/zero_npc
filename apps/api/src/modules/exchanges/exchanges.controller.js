'use strict';

const service = require('./exchanges.service');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const initiate = asyncHandler(async (req, res) => {
  const exchange = await service.initiate({ user: req.user, ...req.body });
  res.status(201).json({ status: 'ok', data: exchange });
});

const respond = asyncHandler(async (req, res) => {
  const exchange = await service.respond({
    user: req.user,
    exchangeId: req.params.id,
    action: req.body.action,
  });
  res.json({ status: 'ok', data: exchange });
});

const validate = asyncHandler(async (req, res) => {
  const exchange = await service.validate({
    user: req.user,
    exchangeId: req.params.id,
    ...req.body,
  });
  res.json({ status: 'ok', data: exchange });
});

const cancel = asyncHandler(async (req, res) => {
  const exchange = await service.cancel({ user: req.user, exchangeId: req.params.id });
  res.json({ status: 'ok', data: exchange });
});

const list = asyncHandler(async (req, res) => {
  const box = req.query.box === 'outbox' ? 'outbox' : 'inbox';
  const items = await service.listForUser({ user: req.user, box });
  res.json({ status: 'ok', data: items });
});

module.exports = { initiate, respond, validate, cancel, list };
