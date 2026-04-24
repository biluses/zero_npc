'use strict';

const { Server } = require('socket.io');
const { verifyAccessToken } = require('../utils/jwt');
const { User } = require('../models');
const logger = require('../config/logger');
const { setIo } = require('./emitter');
const presence = require('./presence');

/**
 * Authenticates a socket using a JWT provided in `auth.token`.
 * Joins the user to their personal room `user:<id>`.
 */
async function authenticateSocket(socket, next) {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Missing auth token'));
    const payload = verifyAccessToken(token);
    const user = await User.findByPk(payload.sub, { attributes: ['id', 'isActive'] });
    if (!user || !user.isActive) return next(new Error('User not found or inactive'));
    socket.data.userId = user.id;
    return next();
  } catch (err) {
    return next(new Error('Unauthorized'));
  }
}

function buildIo(httpServer, corsOrigin) {
  const io = new Server(httpServer, {
    cors: { origin: corsOrigin === '*' ? '*' : corsOrigin.split(',').map((s) => s.trim()) },
    pingTimeout: 30000,
  });

  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    socket.join(`user:${userId}`);

    // Registro de presencia + broadcast.
    const becameOnline = presence.add(userId, socket.id);
    if (becameOnline) broadcastPresence(io);
    // El que acaba de entrar también recibe el estado actual.
    socket.emit('users:online', presence.list());

    logger.debug({ userId, online: presence.count() }, 'Socket connected');

    socket.on('chat:typing', ({ recipientId, isTyping }) => {
      if (!recipientId) return;
      io.to(`user:${recipientId}`).emit('chat:typing', { userId, isTyping: Boolean(isTyping) });
    });

    socket.on('disconnect', () => {
      const becameOffline = presence.remove(userId, socket.id);
      if (becameOffline) broadcastPresence(io);
      logger.debug({ userId, socketId: socket.id, online: presence.count() }, 'Socket disconnected');
    });
  });

  setIo(io);
  return io;
}

function broadcastPresence(io) {
  io.emit('users:online', presence.list());
}

module.exports = { buildIo };
