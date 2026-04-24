'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define(
  'User',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: { type: DataTypes.STRING(254), allowNull: false, unique: true, validate: { isEmail: true } },
    passwordHash: { type: DataTypes.STRING, allowNull: true },
    loginType: {
      type: DataTypes.ENUM('email', 'google', 'apple'),
      allowNull: false,
      defaultValue: 'email',
    },
    googleId: { type: DataTypes.STRING, allowNull: true, unique: true },
    appleId: { type: DataTypes.STRING, allowNull: true, unique: true },
    username: { type: DataTypes.STRING(64), allowNull: true, unique: true },
    firstName: { type: DataTypes.STRING(64), allowNull: true },
    lastName: { type: DataTypes.STRING(64), allowNull: true },
    profilePicture: { type: DataTypes.STRING, allowNull: true },
    fullName: { type: DataTypes.STRING(120), allowNull: true },
    addressLine1: { type: DataTypes.STRING(160), allowNull: true },
    addressLine2: { type: DataTypes.STRING(160), allowNull: true },
    postalCode: { type: DataTypes.STRING(16), allowNull: true },
    province: { type: DataTypes.STRING(80), allowNull: true },
    city: { type: DataTypes.STRING(120), allowNull: true },
    emailVerifiedAt: { type: DataTypes.DATE, allowNull: true },
    verificationOtp: { type: DataTypes.STRING(12), allowNull: true },
    verificationOtpExpiresAt: { type: DataTypes.DATE, allowNull: true },
    resetOtp: { type: DataTypes.STRING(12), allowNull: true },
    resetOtpExpiresAt: { type: DataTypes.DATE, allowNull: true },
    role: { type: DataTypes.ENUM('user', 'admin'), allowNull: false, defaultValue: 'user' },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    tokenCharges: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 5 },
    lastChargeResetAt: { type: DataTypes.DATE, allowNull: true },
    lastLoginAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: 'users',
    indexes: [{ fields: ['email'] }, { fields: ['username'] }],
  },
);

User.prototype.toPublicJSON = function toPublicJSON() {
  const { passwordHash, verificationOtp, resetOtp, verificationOtpExpiresAt, resetOtpExpiresAt, ...rest } =
    this.get({ plain: true });
  return rest;
};

module.exports = User;
