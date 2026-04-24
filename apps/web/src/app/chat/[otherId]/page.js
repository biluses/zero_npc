'use client';

import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';
import { chatApi } from '@/services/domainApi';
import { getSocket } from '@/lib/socket';

export default function ChatThreadPage() {
  return (
    <AuthGuard>
      <AppShell>
        <Inner />
      </AppShell>
    </AuthGuard>
  );
}

function Inner() {
  const { otherId } = useParams();
  const user = useSelector((s) => s.auth.user);
  const accessToken = useSelector((s) => s.auth.accessToken);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    chatApi.messages(otherId).then(setMessages).catch(() => toast.error('Error'));
  }, [otherId]);

  useEffect(() => {
    const socket = getSocket(accessToken);
    if (!socket) return;
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
    <div className="flex h-[calc(100dvh-120px)] flex-col">
      <div className="flex-1 space-y-2 overflow-auto pb-4">
        {messages.map((m) => {
          const mine = m.senderId === user?.id;
          return (
            <div
              key={m.id}
              className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                mine ? 'ml-auto bg-brand-600' : 'mr-auto bg-ink-700'
              }`}
            >
              {m.body}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={onSend} className="flex gap-2 pt-2">
        <input
          className="input flex-1"
          placeholder="Escribe un mensaje…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn-primary px-5">Enviar</button>
      </form>
    </div>
  );
}
