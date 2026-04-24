'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Post = sequelize.define(
  'Post',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    withUserId: { type: DataTypes.UUID, allowNull: true },
    imageUrl: { type: DataTypes.STRING, allowNull: true },
    caption: { type: DataTypes.STRING(280), allowNull: false, defaultValue: '' },
    isDeleted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  {
    tableName: 'posts',
    defaultScope: { where: { isDeleted: false } },
    scopes: { withDeleted: {} },
    indexes: [{ fields: ['user_id'] }, { fields: ['created_at'] }],
  },
);

module.exports = Post;
