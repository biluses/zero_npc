'use strict';

const service = require('./posts.service');
const { parsePagination, paginatedResponse } = require('../../utils/pagination');

const ok = (res, data) => res.json({ status: 'ok', data });
const created = (res, data) => res.status(201).json({ status: 'ok', data });

async function list(req, res, next) {
  try {
    const { limit, offset } = parsePagination(req.query);
    const onlyMine = req.query.onlyMine === 'true';
    const filterUserId = req.query.userId;
    const { rows, count } = await service.listFeed({
      currentUserId: req.user.id,
      limit,
      offset,
      onlyMine,
      filterUserId,
    });
    res.json({ status: 'ok', ...paginatedResponse({ rows, count, limit, offset }) });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const post = await service.getById({ id: req.params.id, currentUserId: req.user.id });
    ok(res, post);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const post = await service.create({
      currentUserId: req.user.id,
      caption: req.body.caption,
      withUserId: req.body.withUserId,
      file: req.file,
    });
    created(res, post);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const post = await service.update({
      id: req.params.id,
      currentUserId: req.user.id,
      caption: req.body.caption,
    });
    ok(res, post);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await service.softDelete({
      id: req.params.id,
      currentUserId: req.user.id,
    });
    ok(res, result);
  } catch (err) {
    next(err);
  }
}

async function like(req, res, next) {
  try {
    const result = await service.toggleLike({
      id: req.params.id,
      currentUserId: req.user.id,
    });
    ok(res, result);
  } catch (err) {
    next(err);
  }
}

async function addComment(req, res, next) {
  try {
    const result = await service.addComment({
      id: req.params.id,
      currentUserId: req.user.id,
      comment: req.body.comment,
      parentId: req.body.parentId,
    });
    created(res, result);
  } catch (err) {
    next(err);
  }
}

async function listComments(req, res, next) {
  try {
    const tree = await service.listComments({ id: req.params.id });
    ok(res, tree);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, update, remove, like, addComment, listComments };
