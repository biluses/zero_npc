'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';
import { chatApi } from '@/services/domainApi';

/**
 * Chat list — XD `Chat (Overview).png`.
 * Header: solo título "Chat" centrado bold.
 * Lista cards: avatar (dot cyan) + nombre + último mensaje + timestamp.
 */
export default function ChatListPage() {
  return (
    <AuthGuard>
      <ChatListContent />
    </AuthGuard>
  );
}

function ChatListContent() {
  const router = useRouter();
  const onlineSet = useSelector((s) => s.presence.online);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await chatApi.threads();
        setThreads(r);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AppShell header="back" title="Chat" onBack={() => router.push('/profile')}>
      <ul className="px-4 pt-2 divide-y divide-border-soft">
        {threads.map((t) => (
          <li key={t.userId}>
            <button
              type="button"
              onClick={() => router.push(`/chat/${t.userId}`)}
              className="w-full flex items-center gap-3 py-3 text-left hover:bg-surface transition rounded-lg px-2"
            >
              <div className="relative shrink-0">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-surface flex items-center justify-center">
                  {t.user?.profilePicture ? (
                    <Image src={t.user.profilePicture} alt="" width={48} height={48} className="object-cover h-full w-full" />
                  ) : (
                    <span className="text-xs font-bold text-text-muted">
                      {(t.user?.username || '??').slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                {onlineSet.includes(t.userId) && (
                  <span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-cyan ring-2 ring-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-night truncate">{t.user?.username || 'Usuario'}</span>
                  {t.unreadCount > 0 && (
                    <span className="ml-1 inline-flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full bg-magenta text-white text-[10px] font-bold">
                      {t.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-muted truncate">{t.lastMessage || 'Nada'}</p>
              </div>
              <span className="text-xs text-text-muted ml-auto shrink-0">{shortTime(t.lastMessageAt)}</span>
            </button>
          </li>
        ))}
      </ul>

      {!loading && threads.length === 0 && (
        <p className="text-center text-text-muted text-sm py-8 px-4">
          Aún no hay chats. Acepta un token y abre uno nuevo.
        </p>
      )}
    </AppShell>
  );
}

function shortTime(d) {
  if (!d) return '';
  const date = new Date(d);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
  return date.toLocaleDateString('es-ES', { weekday: 'long' }).replace(/^./, (c) => c.toUpperCase());
}
