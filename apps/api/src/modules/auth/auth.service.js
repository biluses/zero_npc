'use strict';

const { User } = require('../../models');
const {
  hashPassword,
  verifyPasswordWithMeta,
  validatePasswordStrength,
} = require('../../utils/password');
const { issueTokenPair, verifyRefreshToken } = require('../../utils/jwt');
const { generateOtp, sendMail } = require('../../utils/email');
const { verificationEmail, passwordResetEmail } = require('../../utils/email-templates');
const { grantDailyChargesIfDue } = require('../exchanges/exchanges.service');
const {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} = require('../../utils/errors');
const logger = require('../../config/logger');

const OTP_TTL_MIN = 10;

function expiresInMinutes(m) {
  return new Date(Date.now() + m * 60 * 1000);
}

async function register({ email, password, username, profile }) {
  // Validación server-side de fuerza (fuente única de verdad).
  const strength = validatePasswordStrength(password);
  if (!strength.ok) {
    throw new ValidationError([{ path: 'password', message: strength.reason }]);
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) throw new ConflictError('Email already registered');

  // Username único (si el usuario lo especifica).
  if (username) {
    const takenUser = await User.findOne({ where: { username } });
    if (takenUser) {
      throw new ConflictError('Nombre de usuario en uso');
    }
  }

  const passwordHash = await hashPassword(password);
  const otp = generateOtp();

  // Datos PII opcionales del paso 2 del signup.
  // El modelo los cifra automáticamente al set() vía getters/setters.
  const piiFields = profile && typeof profile === 'object' ? {
    fullName: profile.fullName || null,
    addressLine1: profile.addressLine1 || null,
    addressLine2: profile.addressLine2 || null,
    postalCode: profile.postalCode || null,
    province: profile.province || null,
    city: profile.city || null,
  } : {};

  const user = await User.create({
    email,
    passwordHash,
    username: username || null,
    verificationOtp: otp,
    verificationOtpExpiresAt: expiresInMinutes(OTP_TTL_MIN),
    ...piiFields,
  });

  await sendMail({ to: email, ...verificationEmail({ otp }) }).catch((err) =>
    logger.error({ err }, 'Failed to send verification email'),
  );

  return { userId: user.id, email: user.email };
}

/**
 * Comprueba si un email está disponible para registro.
 * Endpoint público rate-limited para evitar enumeración masiva.
 *
 * Respuesta intencionalmente no revela más información: solo disponible o no.
 * Combinado con rate limiter (pocos req/min por IP), el coste de enumerar
 * un email list grande es prohibitivo.
 */
async function checkEmail({ email }) {
  const existing = await User.findOne({
    where: { email },
    attributes: ['id'], // no cargamos campos PII innecesarios.
  });
  return { available: !existing };
}

/**
 * Valida un paso del flujo signup EN EL BACKEND (no en el cliente).
 * Además de la validación Zod (ya aplicada por el middleware `validate`),
 * añade reglas que requieren consultar BD o lógica de negocio:
 *
 * - Paso 1: fuerza de password (blacklist), email no en uso.
 * - Paso 2: ningún check adicional por ahora (los formatos los valida Zod).
 * - Paso 3: ningún check adicional (el file se valida al subir con multer).
 *
 * Devuelve { ok: true } o lanza ValidationError con detalles por campo.
 * Rate-limited desde el router.
 */
async function validateStep(input) {
  const errors = [];

  if (input.step === 1) {
    const strength = validatePasswordStrength(input.password);
    if (!strength.ok) errors.push({ path: 'password', message: strength.reason });

    const existing = await User.findOne({
      where: { email: input.email },
      attributes: ['id'],
    });
    if (existing) errors.push({ path: 'email', message: 'Email ya registrado' });
  }

  // step 2 y 3: la validación de formato la hace Zod en middleware; no hay reglas
  // extra que consulten BD. Si en el futuro queremos (ej. "provincia válida contra
  // catálogo"), se añade aquí.

  if (errors.length > 0) {
    throw new ValidationError(errors);
  }
  return { ok: true, step: input.step };
}

async function verifyOtp({ email, otp }) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new NotFoundError('User not found');
  if (!user.verificationOtp || !user.verificationOtpExpiresAt) {
    throw new BadRequestError('No verification pending');
  }
  if (user.verificationOtpExpiresAt < new Date()) {
    throw new BadRequestError('OTP expired');
  }
  if (user.verificationOtp !== otp) throw new BadRequestError('Invalid OTP');

  user.emailVerifiedAt = new Date();
  user.verificationOtp = null;
  user.verificationOtpExpiresAt = null;
  await user.save();

  return { verified: true };
}

async function login({ email, password }) {
  const user = await User.findOne({ where: { email } });
  if (!user || !user.passwordHash) throw new UnauthorizedError('Invalid credentials');
  if (!user.isActive) throw new UnauthorizedError('Account disabled');

  const { ok, needsRehash } = await verifyPasswordWithMeta(password, user.passwordHash);
  if (!ok) throw new UnauthorizedError('Invalid credentials');

  if (!user.emailVerifiedAt) throw new UnauthorizedError('Email not verified');

  // Auto-rehash con pepper si el hash es legacy (v1). Transparente para el user.
  if (needsRehash) {
    user.passwordHash = await hashPassword(password);
    logger.info({ userId: user.id }, 'Password re-hashed with pepper on login');
  }

  user.lastLoginAt = new Date();
  await user.save();

  // Refresca cargas diarias de tokens si ha pasado el TTL.
  // El helper hace early-return si no toca todavía.
  await grantDailyChargesIfDue(user);

  const tokens = issueTokenPair(user);
  return { user: user.toPublicJSON(), ...tokens };
}

async function refresh({ refreshToken }) {
  const payload = verifyRefreshToken(refreshToken);
  if (payload.typ !== 'refresh') throw new UnauthorizedError('Invalid refresh token');
  const user = await User.findByPk(payload.sub);
  if (!user || !user.isActive) throw new UnauthorizedError('User not found or inactive');
  return issueTokenPair(user);
}

async function forgot({ email }) {
  const user = await User.findOne({ where: { email } });
  if (!user) return { sent: true };

  const otp = generateOtp();
  user.resetOtp = otp;
  user.resetOtpExpiresAt = expiresInMinutes(OTP_TTL_MIN);
  await user.save();

  await sendMail({ to: email, ...passwordResetEmail({ otp }) }).catch((err) =>
    logger.error({ err }, 'Failed to send reset email'),
  );

  return { sent: true };
}

async function reset({ email, otp, password }) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new NotFoundError('User not found');
  if (!user.resetOtp || !user.resetOtpExpiresAt) throw new BadRequestError('No reset pending');
  if (user.resetOtpExpiresAt < new Date()) throw new BadRequestError('OTP expired');
  if (user.resetOtp !== otp) throw new BadRequestError('Invalid OTP');

  // Validación de fuerza también en reset (fuente única de verdad).
  const strength = validatePasswordStrength(password);
  if (!strength.ok) {
    throw new ValidationError([{ path: 'password', message: strength.reason }]);
  }

  user.passwordHash = await hashPassword(password);
  user.resetOtp = null;
  user.resetOtpExpiresAt = null;
  await user.save();

  return { reset: true };
}

module.exports = { register, verifyOtp, login, refresh, forgot, reset, checkEmail, validateStep };
