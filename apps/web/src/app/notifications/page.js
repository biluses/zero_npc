'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';
import { notificationsApi } from '@/services/domainApi';

/**
 * Notifications — XD `Notifications.png`.
 * Lista con icono + texto + timestamp derecha.
 * Tap marca como leída + navega al recurso.
 */
export default function NotificationsPage() {
  return (
    <AuthGuard>
      <NotificationsContent />
    </AuthGuard>
  );
}

const TYPE_META = {
  token_sent: { icon: '📦↑', text: (p) => `Has enviado un token a @${shortId(p.toUserId)}` },
  token_received: { icon: '📦↓', text: (p) => `@${shortId(p.fromUserId)} te ha enviado un token` },
  token_rejected: { icon: '✗', color: 'reject', text: (p) => `Has rechazado un token` },
  token_accepted: { icon: '✓', color: 'accept', text: () => `Has aceptado un token` },
  message_new: { icon: '✉', color: 'cyan', text: (p) => `Has recibido un mensaje de @${shortId(p.fromUserId)}` },
  post_like: { icon: '♥', color: 'magenta', text: () => 'A alguien le gustó tu publicación' },
  post_comment: { icon: '💬', text: () => 'Comentaron tu publicación' },
  friend_request: { icon: '👤+', text: () => 'Tienes una nueva solicitud de amistad' },
  friend_accepted: { icon: '✓', color: 'accept', text: () => 'Aceptaron tu solicitud de amistad' },
  exchange_validated: { icon: '✓', color: 'accept', text: () => 'Intercambio validado' },
  exchange_cancelled: { icon: '✗', color: 'reject', text: () => 'Intercambio cancelado' },
};

function shortId(id) {
  if (!id) return 'usuario';
  return String(id).slice(0, 6);
}

function NotificationsContent() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const r = await notificationsApi.list({ limit: 50 });
      setItems(r.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function onTap(n) {
    if (!n.readAt) {
      await notificationsApi.markRead(n.id).catch(() => {});
      setItems((p) => p.map((x) => (x.id === n.id ? { ...x, readAt: new Date() } : x)));
    }
    // Navegación contextual
    if (n.type.startsWith('token_') || n.type.startsWith('exchange_')) {
      if (n.payload?.exchangeId) router.push(`/exchange/${n.payload.exchangeId}`);
    } else if (n.type === 'message_new' && n.payload?.fromUserId) {
      router.push(`/chat/${n.payload.fromUserId}`);
    } else if (n.type === 'post_like' || n.type === 'post_comment') {
      if (n.payload?.postId) router.push(`/post/${n.payload.postId}`);
    } else if (n.type === 'friend_request' || n.type === 'friend_accepted') {
      router.push('/friends');
    }
  }

  async function markAll() {
    await notificationsApi.markAllRead().catch(() => {});
    setItems((p) => p.map((x) => ({ ...x, readAt: x.readAt || new Date() })));
  }

  return (
    <AppShell
      header="back"
      title="Notificaciones"
      headerAction={
        items.some((i) => !i.readAt) ? (
          <button type="button" onClick={markAll} className="link-magenta text-xs">
            Marcar todas
          </button>
        ) : null
      }
    >
      <ul className="px-4 pt-2 divide-y divide-border-soft">
        {items.map((n) => {
          const meta = TYPE_META[n.type] || { icon: '•', text: () => n.type };
          return (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => onTap(n)}
                className={`w-full flex items-center gap-3 py-3 text-left hover:bg-surface transition rounded-lg px-2 ${
                  !n.readAt ? 'bg-yellow/10' : ''
                }`}
              >
                <span className={`shrink-0 h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold bg-${meta.color || 'surface'}`}>
                  {meta.icon}
                </span>
                <span className="flex-1 text-sm text-night">{meta.text(n.payload || {})}</span>
                <span className="text-xs text-text-muted shrink-0">{shortTime(n.createdAt)}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {!loading && items.length === 0 && (
        <p className="text-center text-text-muted text-sm py-8 px-4">No tienes notificaciones</p>
      )}
    </AppShell>
  );
}

function shortTime(d) {
  if (!d) return '';
  const date = new Date(d);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return `Hoy, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
  }
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Ayer, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
  }
  return date.toLocaleDateString('es-ES', { weekday: 'long' }).replace(/^./, (c) => c.toUpperCase()) +
    ', ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}
