'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';
import { chatApi, usersApi } from '@/services/domainApi';
import { getSocket } from '@/lib/socket';

/**
 * Chat (Individual) — XD `Chat (Individual).png`.
 *
 * Layout:
 *   - Header back con avatar + username (sin level/rating).
 *   - Burbujas: NEGRAS para mías (right), surface para del otro (left).
 *   - Separadores fecha pill.
 *   - "Leído HH:mm" gris.
 *   - Input pinned bottom con icono enviar magenta.
 */
export default function ChatThreadPage() {
  return (
    <AuthGuard>
      <Inner />
    </AuthGuard>
  );
}

function Inner() {
  const router = useRouter();
  const { otherId } = useParams();
  const me = useSelector((s) => s.auth.user);
  const accessToken = useSelector((s) => s.auth.accessToken);
  const isOnline = useSelector((s) => s.presence.online.includes(otherId));

  const [other, setOther] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    chatApi.messages(otherId).then(setMessages).catch(() => toast.error('Error cargando mensajes'));
    usersApi.byId(otherId).then(setOther).catch(() => {});
  }, [otherId]);

  useEffect(() => {
    const socket = getSocket(accessToken);
    if (!socket) return undefined;
    function onNew(msg) {
      if (msg.senderId === otherId || msg.recipientId === otherId) {
        setMessages((prev) => [...prev, msg]);
      }
    }
    socket.on('chat:new', onNew);
    return () => socket.off('chat:new', onNew);
  }, [otherId, accessToken]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function onSend(e) {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const msg = await chatApi.send({ recipientId: otherId, body: text.trim() });
      setMessages((prev) => [...prev, msg]);
      setText('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error');
    }
  }

  return (
    <AppShell hideNav header={null}>
      {/* Header personalizado del chat */}
      <header className="app-header-back relative gap-3">
        <button onClick={() => router.back()} aria-label="Volver" className="-ml-1 p-2 text-night">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20 6L8 16l12 10" />
          </svg>
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="relative">
            <div className="h-10 w-10 rounded-full overflow-hidden bg-surface flex items-center justify-center">
              {other?.profilePicture ? (
                <Image src={other.profilePicture} alt="" width={40} height={40} className="object-cover h-full w-full" />
              ) : (
                <span className="text-xs font-bold text-text-muted">{(other?.username || '??').slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            {isOnline && (
              <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-cyan ring-2 ring-white" />
            )}
          </div>
          <span className="font-bold text-night text-lg">{other?.username || 'Chat'}</span>
        </div>
      </header>

      {/* Mensajes */}
      <div className="flex-1 px-4 py-3 space-y-2 overflow-y-auto pb-32">
        {groupByDay(messages).map((group, gi) => (
          <div key={gi} className="space-y-2">
            <div className="flex justify-center my-2">
              <span className="text-xs px-3 py-1 rounded-full bg-surface text-text-muted">{group.dayLabel}</span>
            </div>
            {group.items.map((m) => {
              const mine = m.senderId === me?.id;
              return (
                <div key={m.id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                      mine ? 'bg-night text-white' : 'bg-surface text-night'
                    }`}
                  >
                    {m.body}
                  </div>
                  {m.readAt && mine && (
                    <span className="text-[10px] text-text-muted mt-0.5">
                      Leído {new Date(m.readAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input pinned bottom */}
      <form onSubmit={onSend} className="fixed inset-x-0 bottom-0 mx-auto max-w-md p-3 bg-white border-t border-border-soft flex gap-2 safe-bottom">
        <input
          className="input-pill flex-1"
          placeholder="Escribe un mensaje"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={2000}
        />
        <button type="submit" disabled={!text.trim()} aria-label="Enviar" className="h-12 w-12 rounded-full bg-magenta text-white disabled:opacity-50 flex items-center justify-center">
          <SendIcon />
        </button>
      </form>
    </AppShell>
  );
}

function groupByDay(msgs) {
  const groups = [];
  let current = null;
  for (const m of msgs) {
    const key = new Date(m.createdAt).toDateString();
    if (!current || current.key !== key) {
      current = { key, dayLabel: dayLabel(m.createdAt), items: [] };
      groups.push(current);
    }
    current.items.push(m);
  }
  return groups;
}

function dayLabel(d) {
  const date = new Date(d);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return 'Hoy';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
  return date.toLocaleDateString('es-ES', { weekday: 'long' }).replace(/^./, (c) => c.toUpperCase());
}

function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
    </svg>
  );
}
