'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const NOTIFICATION_TYPES = [
  'token_sent',
  'token_received',
  'token_rejected',
  'token_accepted',
  'post_like',
  'post_comment',
  'message_new',
  'friend_request',
  'friend_accepted',
  'exchange_validated',
  'exchange_cancelled',
];

const Notification = sequelize.define(
  'Notification',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    type: { type: DataTypes.ENUM(...NOTIFICATION_TYPES), allowNull: false },
    payload: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
    readAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: 'notifications',
    timestamps: true,
    updatedAt: false,
    indexes: [{ fields: ['user_id', 'created_at'] }],
  },
);

Notification.NOTIFICATION_TYPES = NOTIFICATION_TYPES;

module.exports = Notification;
