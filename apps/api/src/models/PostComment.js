'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PostComment = sequelize.define(
  'PostComment',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    postId: { type: DataTypes.UUID, allowNull: false },
    userId: { type: DataTypes.UUID, allowNull: false },
    parentId: { type: DataTypes.UUID, allowNull: true },
    comment: { type: DataTypes.STRING(500), allowNull: false },
  },
  {
    tableName: 'post_comments',
    indexes: [{ fields: ['post_id'] }, { fields: ['parent_id'] }],
  },
);

module.exports = PostComment;
