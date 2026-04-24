'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { encrypt, decrypt } = require('../utils/crypto');

/**
 * Cifrado transparente de PII en reposo.
 *
 * Los campos PII (fullName, direcciones, CP, provincia, ciudad) se cifran al set()
 * y se descifran al get(). La aplicación JS ve siempre texto plano; la BD guarda
 * siempre el ciphertext con prefijo `enc:v1:...`.
 *
 * NO ciframos email (necesario para lookup en login via índice) ni username (público
 * y buscable desde /users/search).
 *
 * Con getters/setters custom Sequelize aplica la transformación en TODAS las lecturas
 * y escrituras — independientemente de si vienen por Model.create, instance.save,
 * raw query result hydratado, etc. Los `findAll` normales funcionan; para raw=true
 * hay que llamar `decrypt()` manualmente si hace falta.
 */
function piiField(type, column) {
  return {
    type,
    allowNull: true,
    field: column,
    // Nota: set/get usan el nombre del atributo JS (no el de la columna SQL).
    // Sequelize con `underscored: true` se encarga del mapping camelCase ↔ snake_case.
    // Para localizar el atributo correcto derivamos la key JS desde el snake_case column.
    set(value) {
      // `this._modelOptions.instanceMethods` no existe; el nombre JS lo da
      // `this.rawAttributes` reverso, pero más simple: setDataValue(attr, value)
      // donde `attr` es el nombre de la prop JS. Lo sacamos buscando el attr cuya
      // option `field === column`.
      const attrName = findAttrForColumn(this.constructor, column) || toCamel(column);
      this.setDataValue(attrName, value == null ? null : encrypt(String(value)));
    },
    get() {
      const attrName = findAttrForColumn(this.constructor, column) || toCamel(column);
      const raw = this.getDataValue(attrName);
      try {
        return raw == null ? null : decrypt(raw);
      } catch (_err) {
        // Si algo no se puede descifrar (dato corrupto o clave rotada), devolvemos null
        // para no romper la app. El error queda registrado en logs por el caller si inspecciona.
        return null;
      }
    },
  };
}

function toCamel(s) {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function findAttrForColumn(Model, column) {
  if (!Model || !Model.rawAttributes) return null;
  for (const [name, attr] of Object.entries(Model.rawAttributes)) {
    if (attr.field === column) return name;
  }
  return null;
}

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
    firstName: piiField(DataTypes.TEXT, 'first_name'),
    lastName: piiField(DataTypes.TEXT, 'last_name'),
    profilePicture: { type: DataTypes.STRING, allowNull: true },
    // PII cifrado en reposo con AES-256-GCM.
    fullName: piiField(DataTypes.TEXT, 'full_name'),
    addressLine1: piiField(DataTypes.TEXT, 'address_line1'),
    addressLine2: piiField(DataTypes.TEXT, 'address_line2'),
    postalCode: piiField(DataTypes.TEXT, 'postal_code'),
    province: piiField(DataTypes.TEXT, 'province'),
    city: piiField(DataTypes.TEXT, 'city'),
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
