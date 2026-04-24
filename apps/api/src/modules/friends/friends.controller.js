'use strict';

const service = require('./friends.service');
const { parsePagination, paginatedResponse } = require('../../utils/pagination');

async function request(req, res, next) {
  try {
    const r = await service.request({ currentUserId: req.user.id, targetUserId: req.params.userId });
    res.status(201).json({ status: 'ok', data: r });
  } catch (err) { next(err); }
}

async function accept(req, res, next) {
  try {
    const r = await service.accept({ currentUserId: req.user.id, requesterId: req.params.userId });
    res.json({ status: 'ok', data: r });
  } catch (err) { next(err); }
}

async function reject(req, res, next) {
  try {
    const r = await service.reject({ currentUserId: req.user.id, requesterId: req.params.userId });
    res.json({ status: 'ok', data: r });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const r = await service.remove({ currentUserId: req.user.id, otherUserId: req.params.userId });
    res.json({ status: 'ok', data: r });
  } catch (err) { next(err); }
}

async function listFriends(req, res, next) {
  try {
    const { limit, offset } = parsePagination(req.query);
    const { rows, count } = await service.listFriends({
      currentUserId: req.user.id,
      status: req.query.status || 'accepted',
      limit,
      offset,
    });
    res.json({ status: 'ok', ...paginatedResponse({ rows, count, limit, offset }) });
  } catch (err) { next(err); }
}

async function listRequests(req, res, next) {
  try {
    const { limit, offset } = parsePagination(req.query);
    const { rows, count } = await service.listRequests({
      currentUserId: req.user.id,
      type: req.query.type || 'incoming',
      limit,
      offset,
    });
    res.json({ status: 'ok', ...paginatedResponse({ rows, count, limit, offset }) });
  } catch (err) { next(err); }
}

async function discover(req, res, next) {
  try {
    const { limit, offset } = parsePagination(req.query, { defaultLimit: 24, maxLimit: 50 });
    const { rows, count } = await service.discover({
      currentUserId: req.user.id,
      q: (req.query.q || '').trim(),
      limit,
      offset,
    });
    res.json({ status: 'ok', ...paginatedResponse({ rows, count, limit, offset }) });
  } catch (err) { next(err); }
}

module.exports = { request, accept, reject, remove, listFriends, listRequests, discover };
