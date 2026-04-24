'use strict';

const logger = require('../config/logger');
const { emitToUser } = require('../sockets/emitter');

let NotificationModel = null;

function lazyModel() {
  if (NotificationModel) return NotificationModel;
  try {
    NotificationModel = require('../models').Notification || null;
  } catch (_e) {
    NotificationModel = null;
  }
  return NotificationModel;
}

/**
 * Crea una notificación persistida + emite evento socket `notification:new` al destinatario.
 *
 * @param {Object} args
 * @param {string} args.userId       - id del usuario destinatario.
 * @param {string} args.type         - enum: token_sent | token_received | token_rejected | token_accepted | post_like | post_comment | message_new | friend_request | friend_accepted | exchange_validated | exchange_cancelled
 * @param {Object} [args.payload]    - jsonb con IDs/datos públicos (NUNCA secretos).
 * @param {Object} [args.transaction] - sequelize transaction opcional.
 * @returns {Promise<Notification|null>} notificación creada (o null si tabla aún no existe).
 *
 * Si la tabla `notifications` no está disponible (p. ej. migration no aplicada),
 * el helper hace no-op silencioso. Esto permite cablearlo en services antes de
 * tener la tabla creada en BD.
 */
async function createNotification({ userId, type, payload = {}, transaction = null }) {
  if (!userId || !type) {
    logger.warn({ userId, type }, 'createNotification called without userId or type');
    return null;
  }

  const Model = lazyModel();
  if (!Model) return null;

  try {
    const notif = await Model.create(
      {
        userId,
        type,
        payload,
        readAt: null,
      },
      { transaction },
    );

    // Emitir socket SOLO al usuario destinatario (sala 'user:<userId>').
    // Si transaction está activa, esperamos al commit con afterCommit hook.
    if (transaction) {
      transaction.afterCommit(() => {
        emitToUser(userId, 'notification:new', notif.toJSON ? notif.toJSON() : notif);
      });
    } else {
      emitToUser(userId, 'notification:new', notif.toJSON ? notif.toJSON() : notif);
    }

    return notif;
  } catch (err) {
    logger.error({ err, userId, type }, 'Failed to create notification');
    return null;
  }
}

module.exports = { createNotification };
