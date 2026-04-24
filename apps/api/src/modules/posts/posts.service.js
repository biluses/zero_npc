'use strict';

const { Op, fn, col, literal } = require('sequelize');
const { Post, PostLike, PostComment, User } = require('../../models');
const { sequelize } = require('../../config/database');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../../utils/errors');
const { saveUpload } = require('../../utils/upload');
const { createNotification } = require('../../utils/notifications');

/**
 * Devuelve el include estándar para autores de posts/comentarios.
 * Solo expone campos públicos.
 */
function authorInclude(asName = 'author') {
  return {
    model: User,
    as: asName,
    attributes: ['id', 'username', 'firstName', 'lastName', 'profilePicture'],
  };
}

/**
 * Anota cada post con `likeCount`, `commentCount`, `isLiked` (para el currentUserId dado).
 * Se hace en queries separadas (más simple y portable que window functions complejas).
 */
async function annotatePosts(posts, currentUserId) {
  if (!posts.length) return [];
  const ids = posts.map((p) => p.id);

  const likeCounts = await PostLike.findAll({
    attributes: ['postId', [fn('COUNT', col('id')), 'count']],
    where: { postId: { [Op.in]: ids } },
    group: ['postId'],
    raw: true,
  });
  const commentCounts = await PostComment.findAll({
    attributes: ['postId', [fn('COUNT', col('id')), 'count']],
    where: { postId: { [Op.in]: ids } },
    group: ['postId'],
    raw: true,
  });
  const myLikes = currentUserId
    ? await PostLike.findAll({
        attributes: ['postId'],
        where: { postId: { [Op.in]: ids }, userId: currentUserId },
        raw: true,
      })
    : [];

  const likeCountMap = Object.fromEntries(likeCounts.map((r) => [r.postId, Number(r.count)]));
  const commentCountMap = Object.fromEntries(commentCounts.map((r) => [r.postId, Number(r.count)]));
  const likedSet = new Set(myLikes.map((r) => r.postId));

  return posts.map((p) => {
    const json = p.toJSON();
    return {
      ...json,
      likeCount: likeCountMap[p.id] || 0,
      commentCount: commentCountMap[p.id] || 0,
      isLiked: likedSet.has(p.id),
    };
  });
}

async function listFeed({ currentUserId, limit, offset, onlyMine, filterUserId }) {
  const where = {};
  if (onlyMine) {
    where.userId = currentUserId;
  } else if (filterUserId) {
    where.userId = filterUserId;
  }

  const { rows, count } = await Post.findAndCountAll({
    where,
    include: [authorInclude(), { ...authorInclude('withUser'), required: false }],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  const annotated = await annotatePosts(rows, currentUserId);
  return { rows: annotated, count };
}

async function getById({ id, currentUserId }) {
  const post = await Post.findByPk(id, {
    include: [authorInclude(), { ...authorInclude('withUser'), required: false }],
  });
  if (!post) throw new NotFoundError('Post not found');
  const [annotated] = await annotatePosts([post], currentUserId);
  return annotated;
}

async function create({ currentUserId, caption, withUserId, file }) {
  let imageUrl = null;
  if (file) {
    imageUrl = await saveUpload(file.buffer, file.mimetype, 'posts');
  }
  const post = await Post.create({
    userId: currentUserId,
    withUserId: withUserId || null,
    caption: caption || '',
    imageUrl,
  });
  return getById({ id: post.id, currentUserId });
}

async function update({ id, currentUserId, caption }) {
  const post = await Post.findByPk(id);
  if (!post) throw new NotFoundError('Post not found');
  if (post.userId !== currentUserId) throw new ForbiddenError('Not your post');
  if (typeof caption === 'string') post.caption = caption;
  await post.save();
  return getById({ id, currentUserId });
}

async function softDelete({ id, currentUserId }) {
  const post = await Post.findByPk(id);
  if (!post) throw new NotFoundError('Post not found');
  if (post.userId !== currentUserId) throw new ForbiddenError('Not your post');
  post.isDeleted = true;
  await post.save();
  return { id, deleted: true };
}

async function toggleLike({ id, currentUserId }) {
  return sequelize.transaction(async (t) => {
    const post = await Post.findByPk(id, { transaction: t });
    if (!post) throw new NotFoundError('Post not found');

    const existing = await PostLike.findOne({
      where: { postId: id, userId: currentUserId },
      transaction: t,
    });

    if (existing) {
      await existing.destroy({ transaction: t });
      return { liked: false };
    }
    await PostLike.create({ postId: id, userId: currentUserId }, { transaction: t });

    if (post.userId !== currentUserId) {
      await createNotification({
        userId: post.userId,
        type: 'post_like',
        payload: { postId: id, byUserId: currentUserId },
        transaction: t,
      });
    }
    return { liked: true };
  });
}

async function addComment({ id, currentUserId, comment, parentId }) {
  return sequelize.transaction(async (t) => {
    const post = await Post.findByPk(id, { transaction: t });
    if (!post) throw new NotFoundError('Post not found');

    if (parentId) {
      const parent = await PostComment.findOne({
        where: { id: parentId, postId: id },
        transaction: t,
      });
      if (!parent) throw new BadRequestError('Parent comment not found');
    }

    const created = await PostComment.create(
      {
        postId: id,
        userId: currentUserId,
        parentId: parentId || null,
        comment,
      },
      { transaction: t },
    );

    if (post.userId !== currentUserId) {
      await createNotification({
        userId: post.userId,
        type: 'post_comment',
        payload: { postId: id, commentId: created.id, byUserId: currentUserId },
        transaction: t,
      });
    }

    const withAuthor = await PostComment.findByPk(created.id, {
      include: [authorInclude()],
      transaction: t,
    });
    return withAuthor;
  });
}

/**
 * Construye un árbol anidado de comentarios para un post.
 * Devuelve la lista raíz (parentId = null) con `replies` recursivos.
 */
async function listComments({ id }) {
  const all = await PostComment.findAll({
    where: { postId: id },
    include: [authorInclude()],
    order: [['createdAt', 'ASC']],
  });

  const byParent = new Map();
  all.forEach((c) => {
    const key = c.parentId || 'root';
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(c.toJSON());
  });

  function attach(node) {
    const children = byParent.get(node.id) || [];
    return { ...node, replies: children.map(attach) };
  }

  const roots = byParent.get('root') || [];
  return roots.map(attach);
}

module.exports = {
  listFeed,
  getById,
  create,
  update,
  softDelete,
  toggleLike,
  addComment,
  listComments,
};
