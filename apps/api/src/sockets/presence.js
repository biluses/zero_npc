'use strict';

/**
 * Módulo de presencia online en memoria.
 *
 * Mantiene un map userId → Set<socketId> para que:
 *   - Un mismo usuario con varios dispositivos cuente como "online" una sola vez.
 *   - Al cerrarse el último socket, pasa a offline.
 *
 * IMPORTANTE: presencia en memoria del proceso.
 * Si se escalan múltiples nodos (horizontal scaling), hay que mover esto a
 * Redis con pub/sub + socket.io-redis-adapter. Para MVP (1 proceso) basta.
 */

const userSockets = new Map();

/**
 * Añade un socketId al set de un usuario.
 * @returns {boolean} true si el usuario pasó de offline → online.
 */
function add(userId, socketId) {
  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set([socketId]));
    return true;
  }
  userSockets.get(userId).add(socketId);
  return false;
}

/**
 * Quita un socketId del set de un usuario.
 * @returns {boolean} true si el usuario pasó de online → offline.
 */
function remove(userId, socketId) {
  const set = userSockets.get(userId);
  if (!set) return false;
  set.delete(socketId);
  if (set.size === 0) {
    userSockets.delete(userId);
    return true;
  }
  return false;
}

/** @returns {string[]} lista de userIds online. */
function list() {
  return Array.from(userSockets.keys());
}

function has(userId) {
  return userSockets.has(userId);
}

function count() {
  return userSockets.size;
}

function clear() {
  userSockets.clear();
}

module.exports = { add, remove, list, has, count, clear };
