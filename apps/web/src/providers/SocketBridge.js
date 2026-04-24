'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getSocket, closeSocket } from '@/lib/socket';

export default function SocketBridge() {
  const accessToken = useSelector((s) => s.auth.accessToken);

  useEffect(() => {
    if (accessToken) {
      getSocket(accessToken);
    } else {
      closeSocket();
    }
    return () => {};
  }, [accessToken]);

  return null;
}
