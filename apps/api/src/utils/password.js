'use strict';

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { loadEnv } = require('../config/env');

const env = loadEnv();

/**
 * Hashing de contraseñas con PEPPER + bcrypt.
 *
 * Arquitectura:
 *   1. HMAC-SHA256 con pepper del server como clave → derivamos un digest constante por password.
 *   2. bcrypt hash de ese digest con salt y rounds.
 *
 * Ventajas:
 *   - Si se filtra la BD pero NO el pepper: los hashes son inmunes a rainbow tables y
 *     fuerza bruta offline (atacante necesita el pepper para intentar passwords).
 *   - HMAC-SHA256 previa evita el límite de 72 bytes de bcrypt: el digest hex siempre tiene 64 chars.
 *   - Bcrypt aporta salt aleatorio + coste computacional.
 *
 * Versión de hash (`version` opcional):
 *   - 2 (actual): PEPPER + HMAC + bcrypt.
 *   - 1 (legacy): bcrypt directo sin pepper — soportado solo en verify para migrar users antiguos.
 */

const CURRENT_VERSION = 2;

function peppered(plain) {
  // HMAC-SHA256(pepper, plain) → hex. Constante en longitud, inmune al truncamiento de bcrypt.
  return crypto.createHmac('sha256', env.PASSWORD_PEPPER).update(String(plain)).digest('hex');
}

async function hashPassword(plain) {
  if (!plain || typeof plain !== 'string') {
    throw new Error('hashPassword requires a non-empty string');
  }
  const digest = peppered(plain);
  return bcrypt.hash(digest, env.BCRYPT_SALT_ROUNDS);
}

/**
 * Verifica una contraseña contra su hash.
 * Soporta ambas versiones:
 *   - v2 (actual): intenta primero con pepper.
 *   - v1 (legacy): si v2 falla, intenta bcrypt directo (usuarios creados antes del pepper).
 *     Devuelve `{ ok, needsRehash: true }` para que el caller re-hashee con la versión nueva.
 *
 * @returns {Promise<{ok: boolean, needsRehash: boolean}>}
 */
async function verifyPasswordWithMeta(plain, hash) {
  if (!plain || !hash) return { ok: false, needsRehash: false };

  // Intento v2 (pepper).
  try {
    const digest = peppered(plain);
    if (await bcrypt.compare(digest, hash)) {
      return { ok: true, needsRehash: false };
    }
  } catch (_e) {
    // hash corrupto u otro, continúa con v1.
  }

  // Fallback v1 (legacy sin pepper) para no romper logins existentes.
  try {
    if (await bcrypt.compare(plain, hash)) {
      return { ok: true, needsRehash: true };
    }
  } catch (_e) { /* ignore */ }

  return { ok: false, needsRehash: false };
}

/**
 * API simple compatible con el código existente.
 * Solo devuelve boolean; el re-hash automático se hace en auth.service.login.
 */
async function verifyPassword(plain, hash) {
  const res = await verifyPasswordWithMeta(plain, hash);
  return res.ok;
}

/**
 * Validación fuerte de contraseña (server-side).
 * Usado tanto en registro como en reset-password.
 *
 * Reglas:
 *  - min 8 chars
 *  - max 128 (evita ataques DoS con bcrypt)
 *  - al menos 1 letra
 *  - al menos 1 dígito
 *  - NO estar en una blacklist corta (contraseñas obvias).
 *
 * @returns {{ok: boolean, reason?: string}}
 */
const COMMON_PASSWORDS = new Set([
  'password', 'password1', '12345678', '123456789', 'qwerty123',
  '11111111', 'abcdefgh', 'iloveyou', 'admin123', 'letmein1',
]);

function validatePasswordStrength(plain) {
  if (typeof plain !== 'string') return { ok: false, reason: 'Contraseña requerida' };
  if (plain.length < 8) return { ok: false, reason: 'Mínimo 8 caracteres' };
  if (plain.length > 128) return { ok: false, reason: 'Máximo 128 caracteres' };
  if (!/[A-Za-z]/.test(plain)) return { ok: false, reason: 'Debe contener al menos una letra' };
  if (!/\d/.test(plain)) return { ok: false, reason: 'Debe contener al menos un número' };
  if (COMMON_PASSWORDS.has(plain.toLowerCase())) {
    return { ok: false, reason: 'Demasiado común, elige otra' };
  }
  return { ok: true };
}

module.exports = {
  hashPassword,
  verifyPassword,
  verifyPasswordWithMeta,
  validatePasswordStrength,
  CURRENT_VERSION,
};
