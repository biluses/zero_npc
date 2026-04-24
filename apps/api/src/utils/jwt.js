'use strict';

const jwt = require('jsonwebtoken');
const { loadEnv } = require('../config/env');
const { UnauthorizedError } = require('./errors');

const env = loadEnv();

function signAccessToken(payload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY,
    issuer: 'zero-npc',
    audience: 'zero-npc-web',
  });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY,
    issuer: 'zero-npc',
    audience: 'zero-npc-web',
  });
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET, {
      issuer: 'zero-npc',
      audience: 'zero-npc-web',
    });
  } catch (err) {
    throw new UnauthorizedError(err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token');
  }
}

function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET, {
      issuer: 'zero-npc',
      audience: 'zero-npc-web',
    });
  } catch (err) {
    throw new UnauthorizedError(err.name === 'TokenExpiredError' ? 'Refresh token expired' : 'Invalid refresh token');
  }
}

function issueTokenPair(user) {
  const payload = { sub: user.id, email: user.email };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken({ ...payload, typ: 'refresh' }),
  };
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  issueTokenPair,
};
