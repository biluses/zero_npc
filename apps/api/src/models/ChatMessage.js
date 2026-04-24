'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChatMessage = sequelize.define(
  'ChatMessage',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    senderId: { type: DataTypes.UUID, allowNull: false },
    recipientId: { type: DataTypes.UUID, allowNull: false },
    exchangeId: { type: DataTypes.UUID, allowNull: true },
    body: { type: DataTypes.TEXT, allowNull: false },
    messageType: {
      type: DataTypes.ENUM('text', 'image', 'system', 'exchange'),
      allowNull: false,
      defaultValue: 'text',
    },
    readAt: { type: DataTypes.DATE, allowNull: true },
    deliveredAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: 'chat_messages',
    indexes: [
      { fields: ['sender_id', 'recipient_id'] },
      { fields: ['recipient_id', 'read_at'] },
      { fields: ['exchange_id'] },
    ],
  },
);

module.exports = ChatMessage;
