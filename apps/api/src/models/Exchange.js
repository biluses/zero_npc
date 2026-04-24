'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EXCHANGE_STATES = ['pending', 'accepted', 'validated', 'rejected', 'cancelled', 'expired'];

const Exchange = sequelize.define(
  'Exchange',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    tokenId: { type: DataTypes.UUID, allowNull: false },
    senderId: { type: DataTypes.UUID, allowNull: false },
    recipientId: { type: DataTypes.UUID, allowNull: false },
    status: {
      type: DataTypes.ENUM(...EXCHANGE_STATES),
      allowNull: false,
      defaultValue: 'pending',
    },
    message: { type: DataTypes.TEXT, allowNull: true },
    acceptedAt: { type: DataTypes.DATE, allowNull: true },
    validatedAt: { type: DataTypes.DATE, allowNull: true },
    rejectedAt: { type: DataTypes.DATE, allowNull: true },
    cancelledAt: { type: DataTypes.DATE, allowNull: true },
    expiresAt: { type: DataTypes.DATE, allowNull: true },
    scanMethod: { type: DataTypes.ENUM('nfc', 'qr'), allowNull: true },
  },
  {
    tableName: 'exchanges',
    indexes: [
      { fields: ['token_id'] },
      { fields: ['sender_id'] },
      { fields: ['recipient_id'] },
      { fields: ['status'] },
    ],
  },
);

Exchange.STATES = EXCHANGE_STATES;

module.exports = Exchange;
