'use strict';

let ioInstance = null;

function setIo(io) {
  ioInstance = io;
}

function getIo() {
  return ioInstance;
}

/** Emits an event to the personal room of a user (user:<userId>). */
function emitToUser(userId, event, payload) {
  if (!ioInstance) return;
  ioInstance.to(`user:${userId}`).emit(event, payload);
}

module.exports = { setIo, getIo, emitToUser };
