'use strict';

const { UnauthorizedError, ForbiddenError } = require('../utils/errors');
const { verifyAccessToken } = require('../utils/jwt');
const { User } = require('../models');

async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) throw new UnauthorizedError('Missing bearer token');

    const payload = verifyAccessToken(token);
    const user = await User.findByPk(payload.sub, {
      attributes: ['id', 'email', 'username', 'role', 'isActive'],
    });
    if (!user || !user.isActive) throw new UnauthorizedError('User not found or inactive');

    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
}

function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(new UnauthorizedError());
    if (!roles.includes(req.user.role)) return next(new ForbiddenError('Insufficient role'));
    return next();
  };
}

module.exports = { requireAuth, requireRole };
