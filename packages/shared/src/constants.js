'use strict';

/**
 * Domain constants shared between api and web.
 * Keep this file small, dependency-free, and CommonJS-compatible so both
 * Node.js (api) and Next.js (web) can consume it without tsconfig tricks.
 */

const EXCHANGE_STATUSES = Object.freeze([
  'pending',
  'accepted',
  'validated',
  'rejected',
  'cancelled',
  'expired',
]);

const ORDER_STATUSES = Object.freeze([
  'pending',
  'paid',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]);

const TAG_TYPES = Object.freeze(['nfc', 'qr']);
const SCAN_METHODS = Object.freeze(['nfc', 'qr']);
const USER_ROLES = Object.freeze(['user', 'admin']);
const LOGIN_TYPES = Object.freeze(['email', 'google', 'apple']);

const DEFAULT_CURRENCY = 'EUR';
const SUPPORTED_LOCALES = Object.freeze(['es-ES']);
const DEFAULT_LOCALE = 'es-ES';

module.exports = {
  EXCHANGE_STATUSES,
  ORDER_STATUSES,
  TAG_TYPES,
  SCAN_METHODS,
  USER_ROLES,
  LOGIN_TYPES,
  DEFAULT_CURRENCY,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
};
