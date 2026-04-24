'use strict';

const service = require('./tokens.service');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const register = asyncHandler(async (req, res) => {
  const token = await service.registerToken({ user: req.user, ...req.body });
  res.status(201).json({ status: 'ok', data: token });
});

const lookup = asyncHandler(async (req, res) => {
  const token = await service.lookupByTag({ tagUid: req.query.tagUid });
  res.json({ status: 'ok', data: token });
});

const list = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 50;
  const offset = Number(req.query.offset) || 0;
  const result = await service.listMyTokens({ user: req.user, limit, offset });
  res.json({ status: 'ok', ...result });
});

const byId = asyncHandler(async (req, res) => {
  const token = await service.getTokenById({ user: req.user, id: req.params.id });
  res.json({ status: 'ok', data: token });
});

module.exports = { register, lookup, list, byId };
