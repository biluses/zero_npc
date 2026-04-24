'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';
import { chatApi } from '@/services/domainApi';

export default function ChatListPage() {
  return (
    <AuthGuard>
      <AppShell>
        <Inner />
      </AppShell>
    </AuthGuard>
  );
}

function Inner() {
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    chatApi.threads().then(setThreads).catch(() => toast.error('Error'));
  }, []);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Mensajes</h1>
      {threads.length === 0 ? (
        <p className="text-sm text-white/60">No tienes conversaciones.</p>
      ) : (
        <ul className="space-y-2">
          {threads.map((t) => (
            <li key={t.userId} className="card">
              <Link href={`/chat/${t.userId}`} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t.user?.username || t.userId}</p>
                  <p className="text-xs text-white/60 truncate max-w-[220px]">{t.lastMessage}</p>
                </div>
                {t.unreadCount > 0 && (
                  <span className="rounded-full bg-brand-500 px-2 py-0.5 text-xs">{t.unreadCount}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
