'use strict';

const request = require('supertest');
const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');

const app = require('../src/app');
const { sequelize } = require('../src/config/database');
const { User } = require('../src/models');

/**
 * Helpers de test reutilizables.
 *
 * - `truncateAll()`: limpia tablas de datos (preserva esquemas + policies seed).
 * - `createUser()`: crea un usuario verificado listo para login.
 * - `loginAs()`: hace login y devuelve { user, token }.
 * - `authedRequest(token)`: supertest agent con header Authorization.
 */

async function truncateAll() {
  // Orden importa: hijas antes que padres para evitar FK errors.
  // Usamos `TRUNCATE ... CASCADE` para simplificar.
  await sequelize.query(`
    TRUNCATE TABLE
      notifications,
      post_comments,
      post_likes,
      posts,
      friendships,
      chat_messages,
      order_items,
      orders,
      exchanges,
      tokens,
      users
    RESTART IDENTITY CASCADE;
  `);
}

let userCounter = 0;

/**
 * Crea un usuario con email verificado listo para login.
 * @param {Object} [overrides]
 * @returns {Promise<User>}
 */
async function createUser(overrides = {}) {
  userCounter += 1;
  const suffix = `${Date.now().toString(36)}${userCounter}`;
  const email = overrides.email || `u${suffix}@test.com`;
  const plainPassword = overrides.password || 'TestPass123!';
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const user = await User.create({
    email,
    passwordHash,
    username: overrides.username || `user_${suffix}`,
    fullName: overrides.fullName || 'Test User',
    emailVerifiedAt: new Date(),
    isActive: true,
    tokenCharges: 5,
    ...overrides,
    // sobrescribe passwordHash al final para garantizar el hash nuevo:
    passwordHash: overrides.passwordHash || passwordHash,
  });

  user._plainPassword = plainPassword;
  return user;
}

/**
 * Hace login con los credenciales del user creado y devuelve { user, token }.
 */
async function loginAs(user) {
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: user.email, password: user._plainPassword });

  if (res.status !== 200) {
    throw new Error(`Login failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return { user: res.body.data.user, token: res.body.data.accessToken };
}

function authedRequest(token) {
  return {
    get: (url) => request(app).get(url).set('Authorization', `Bearer ${token}`),
    post: (url) => request(app).post(url).set('Authorization', `Bearer ${token}`),
    patch: (url) => request(app).patch(url).set('Authorization', `Bearer ${token}`),
    delete: (url) => request(app).delete(url).set('Authorization', `Bearer ${token}`),
  };
}

async function closeAll() {
  try {
    await sequelize.close();
  } catch (_e) { /* ignore */ }
}

module.exports = {
  app,
  request,
  sequelize,
  User,
  truncateAll,
  createUser,
  loginAs,
  authedRequest,
  closeAll,
};
