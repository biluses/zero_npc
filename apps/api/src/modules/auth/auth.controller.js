'use strict';

const service = require('./auth.service');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const register = asyncHandler(async (req, res) => {
  const result = await service.register(req.body);
  res.status(201).json({ status: 'ok', data: result });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const result = await service.verifyOtp(req.body);
  res.json({ status: 'ok', data: result });
});

const login = asyncHandler(async (req, res) => {
  const result = await service.login(req.body);
  res.json({ status: 'ok', data: result });
});

const refresh = asyncHandler(async (req, res) => {
  const result = await service.refresh(req.body);
  res.json({ status: 'ok', data: result });
});

const forgot = asyncHandler(async (req, res) => {
  const result = await service.forgot(req.body);
  res.json({ status: 'ok', data: result });
});

const reset = asyncHandler(async (req, res) => {
  const result = await service.reset(req.body);
  res.json({ status: 'ok', data: result });
});

const me = asyncHandler(async (req, res) => {
  res.json({ status: 'ok', data: { user: req.user.toPublicJSON() } });
});

module.exports = { register, verifyOtp, login, refresh, forgot, reset, me };
