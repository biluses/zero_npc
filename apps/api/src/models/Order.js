'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define(
  'Order',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'),
      allowNull: false,
      defaultValue: 'pending',
    },
    totalCents: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'EUR' },
    stripeCheckoutSessionId: { type: DataTypes.STRING, allowNull: true, unique: true },
    stripePaymentIntentId: { type: DataTypes.STRING, allowNull: true },
    shippingAddress: { type: DataTypes.JSONB, allowNull: true },
    paidAt: { type: DataTypes.DATE, allowNull: true },
  },
  { tableName: 'orders', indexes: [{ fields: ['user_id'] }, { fields: ['status'] }] },
);

const OrderItem = sequelize.define(
  'OrderItem',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    orderId: { type: DataTypes.UUID, allowNull: false },
    productId: { type: DataTypes.UUID, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    unitPriceCents: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    lineTotalCents: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  { tableName: 'order_items', indexes: [{ fields: ['order_id'] }, { fields: ['product_id'] }] },
);

module.exports = { Order, OrderItem };
