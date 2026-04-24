'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Token = unidad intercambiable asociada a un Product (pin NFC o QR).
 * `tagUid` es el UID único que imprime/NFCWriter graba en el pin físico.
 * `originalOwnerId` es el primer propietario (cuando se registró el pin).
 * `currentOwnerId` es el propietario actual (va cambiando con cada intercambio).
 */
const Token = sequelize.define(
  'Token',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    productId: { type: DataTypes.UUID, allowNull: false },
    tagUid: { type: DataTypes.STRING(128), allowNull: false, unique: true },
    tagType: { type: DataTypes.ENUM('nfc', 'qr'), allowNull: false, defaultValue: 'nfc' },
    serial: { type: DataTypes.STRING(64), allowNull: true, unique: true },
    originalOwnerId: { type: DataTypes.UUID, allowNull: false },
    currentOwnerId: { type: DataTypes.UUID, allowNull: false },
    exchangeCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    isLocked: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    registeredAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    lastExchangeAt: { type: DataTypes.DATE, allowNull: true },
    metadata: { type: DataTypes.JSONB, allowNull: true },
  },
  {
    tableName: 'tokens',
    indexes: [
      { fields: ['product_id'] },
      { fields: ['current_owner_id'] },
      { fields: ['original_owner_id'] },
    ],
  },
);

module.exports = Token;
