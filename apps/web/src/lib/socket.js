'use client';

import { io } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8000';

let socket = null;

export function getSocket(token) {
  if (!token) return null;
  if (socket && socket.connected) return socket;
  if (socket) socket.disconnect();
  socket = io(WS_URL, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
  });
  return socket;
}

export function closeSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
