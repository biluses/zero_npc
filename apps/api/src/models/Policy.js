'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Policy = sequelize.define(
  'Policy',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    type: { type: DataTypes.ENUM('privacy', 'cookies', 'terms'), allowNull: false, unique: true },
    title: { type: DataTypes.STRING(200), allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    tableName: 'policies',
    timestamps: true,
    createdAt: false,
    updatedAt: 'updated_at',
  },
);

module.exports = Policy;
