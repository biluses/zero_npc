'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';
import { tokensApi } from '@/services/domainApi';

export default function WardrobePage() {
  return (
    <AuthGuard>
      <AppShell>
        <WardrobeContent />
      </AppShell>
    </AuthGuard>
  );
}

function WardrobeContent() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tokensApi
      .list()
      .then((res) => setItems(res.items || res || []))
      .catch((err) => toast.error(err?.response?.data?.message || 'Error'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Mi armario</h1>
        <Link href="/scan" className="btn-secondary text-xs">
          + Añadir pin
        </Link>
      </header>

      {loading ? (
        <p className="text-sm text-white/60">Cargando…</p>
      ) : items.length === 0 ? (
        <div className="card text-center">
          <p className="text-sm text-white/70">Tu armario está vacío.</p>
          <Link href="/scan" className="btn-primary mt-4 inline-block">
            Escanear un pin
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3">
          {items.map((token) => (
            <li key={token.id} className="card">
              <Link href={`/token/${token.id}`}>
                <div className="aspect-square rounded-xl bg-ink-700" />
                <p className="mt-3 text-sm font-semibold">{token.product?.name || 'Token'}</p>
                <p className="text-xs text-white/60 truncate">{token.tagUid}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
