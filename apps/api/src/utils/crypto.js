'use strict';

const crypto = require('crypto');
const { loadEnv } = require('../config/env');

/**
 * Cifrado de PII en reposo con AES-256-GCM.
 *
 * Formato del ciphertext almacenado en BD:
 *   `enc:v1:<iv_base64>:<auth_tag_base64>:<ciphertext_base64>`
 *
 * - Prefijo `enc:v1:` permite detectar valores ya cifrados y rotar versiones.
 * - GCM proporciona autenticación (AAD) además de cifrado: detecta tampering.
 * - IV de 12 bytes aleatorio POR VALOR (crítico con GCM para no repetir el keystream).
 *
 * Campos típicamente cifrados: fullName, addressLine1, addressLine2, postalCode,
 * province, city. NO ciframos email (necesario para lookup en login) ni username
 * (público). La password ya usa pepper + bcrypt separado.
 *
 * Rotación de DATA_ENCRYPTION_KEY:
 *   1. Mantener la clave actual como secundaria.
 *   2. Generar clave nueva.
 *   3. Job que decripta con la antigua y re-cifra con la nueva → actualiza campo.
 *   4. Retirar clave antigua una vez migrada toda la tabla.
 */

const env = loadEnv();

const ALGO = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const ENC_PREFIX = 'enc:v1:';

function getKey() {
  const raw = Buffer.from(env.DATA_ENCRYPTION_KEY, 'base64');
  if (raw.length !== KEY_LENGTH) {
    throw new Error(
      `DATA_ENCRYPTION_KEY debe decodificar a ${KEY_LENGTH} bytes, encontrados ${raw.length}. ` +
      'Genera con: openssl rand -base64 32',
    );
  }
  return raw;
}

// Cache de la key para no decodificar base64 en cada operación.
let cachedKey = null;
function key() {
  if (!cachedKey) cachedKey = getKey();
  return cachedKey;
}

/**
 * Cifra un string. Devuelve null si input es null/undefined.
 * Devuelve el input tal cual si ya viene cifrado (idempotente).
 */
function encrypt(plain) {
  if (plain == null) return null;
  const str = String(plain);
  if (str.length === 0) return '';
  if (isEncrypted(str)) return str;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, key(), iv);
  const ct = Buffer.concat([cipher.update(str, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${ENC_PREFIX}${iv.toString('base64')}:${tag.toString('base64')}:${ct.toString('base64')}`;
}

/**
 * Descifra un valor. Si el input no está cifrado, devuelve tal cual (backward compat).
 */
function decrypt(enc) {
  if (enc == null) return null;
  const str = String(enc);
  if (str.length === 0) return '';
  if (!isEncrypted(str)) return str; // datos antiguos sin cifrar → compatible.

  const parts = str.slice(ENC_PREFIX.length).split(':');
  if (parts.length !== 3) {
    throw new Error('Ciphertext inválido: formato incorrecto');
  }
  const [ivB64, tagB64, ctB64] = parts;
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const ct = Buffer.from(ctB64, 'base64');

  const decipher = crypto.createDecipheriv(ALGO, key(), iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(ct), decipher.final()]);
  return plain.toString('utf8');
}

function isEncrypted(value) {
  return typeof value === 'string' && value.startsWith(ENC_PREFIX);
}

module.exports = { encrypt, decrypt, isEncrypted, ENC_PREFIX };
