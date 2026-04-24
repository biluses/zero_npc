'use client';

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getSocket, closeSocket } from '@/lib/socket';
import { incrementUnread, setUnreadCount } from '@/store/slices/notificationsSlice';
import { notificationsApi } from '@/services/domainApi';

const TYPE_LABEL = {
  token_received: 'Te han enviado un token',
  token_accepted: 'Han aceptado tu token',
  token_rejected: 'Han rechazado tu token',
  message_new: 'Nuevo mensaje',
  post_like: 'A alguien le gustó tu publicación',
  post_comment: 'Comentaron tu publicación',
  friend_request: 'Nueva solicitud de amistad',
  friend_accepted: 'Aceptaron tu solicitud',
  exchange_validated: 'Intercambio validado',
  exchange_cancelled: 'Intercambio cancelado',
};

/**
 * SocketBridge global:
 *   - Conecta el socket cuando hay accessToken.
 *   - Hidrata el unreadCount desde el endpoint al login.
 *   - Escucha `notification:new` para mostrar toast + incrementar badge.
 */
export default function SocketBridge() {
  const dispatch = useDispatch();
  const accessToken = useSelector((s) => s.auth.accessToken);
  const subscribed = useRef(false);

  useEffect(() => {
    if (!accessToken) {
      closeSocket();
      subscribed.current = false;
      return undefined;
    }

    const socket = getSocket(accessToken);
    if (!socket) return undefined;

    // Hidrata el contador inicial.
    notificationsApi.unreadCount()
      .then((r) => dispatch(setUnreadCount(r.count || 0)))
      .catch(() => {});

    if (subscribed.current) return undefined;
    subscribed.current = true;

    function onNotification(notif) {
      dispatch(incrementUnread());
      const label = TYPE_LABEL[notif.type] || 'Nueva notificación';
      toast.info(label);
    }

    socket.on('notification:new', onNotification);
    return () => {
      socket.off('notification:new', onNotification);
      subscribed.current = false;
    };
  }, [accessToken, dispatch]);

  return null;
}
