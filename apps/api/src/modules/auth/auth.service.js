'use strict';

const { User } = require('../../models');
const { hashPassword, verifyPassword } = require('../../utils/password');
const { issueTokenPair, verifyRefreshToken } = require('../../utils/jwt');
const { generateOtp, sendMail } = require('../../utils/email');
const { verificationEmail, passwordResetEmail } = require('../../utils/email-templates');
const { grantDailyChargesIfDue } = require('../exchanges/exchanges.service');
const {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} = require('../../utils/errors');
const logger = require('../../config/logger');

const OTP_TTL_MIN = 10;

function expiresInMinutes(m) {
  return new Date(Date.now() + m * 60 * 1000);
}

async function register({ email, password, username }) {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new ConflictError('Email already registered');

  const passwordHash = await hashPassword(password);
  const otp = generateOtp();

  const user = await User.create({
    email,
    passwordHash,
    username: username || null,
    verificationOtp: otp,
    verificationOtpExpiresAt: expiresInMinutes(OTP_TTL_MIN),
  });

  await sendMail({ to: email, ...verificationEmail({ otp }) }).catch((err) =>
    logger.error({ err }, 'Failed to send verification email'),
  );

  return { userId: user.id, email: user.email };
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

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw new UnauthorizedError('Invalid credentials');

  if (!user.emailVerifiedAt) throw new UnauthorizedError('Email not verified');

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

  user.passwordHash = await hashPassword(password);
  user.resetOtp = null;
  user.resetOtpExpiresAt = null;
  await user.save();

  return { reset: true };
}

module.exports = { register, verifyOtp, login, refresh, forgot, reset };
