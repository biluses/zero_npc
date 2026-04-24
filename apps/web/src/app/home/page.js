'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';
import { tokensApi, exchangesApi } from '@/services/domainApi';

export default function HomePage() {
  return (
    <AuthGuard>
      <AppShell>
        <HomeContent />
      </AppShell>
    </AuthGuard>
  );
}

function HomeContent() {
  const user = useSelector((s) => s.auth.user);
  const [tokens, setTokens] = useState([]);
  const [pending, setPending] = useState([]);

  useEffect(() => {
    Promise.all([tokensApi.list().catch(() => ({ items: [] })), exchangesApi.list('inbox').catch(() => [])])
      .then(([t, e]) => {
        setTokens(t.items || t || []);
        setPending((e || []).filter((x) => x.status === 'pending'));
      })
      .catch((err) => toast.error(err?.message || 'Error cargando datos'));
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-white/60">Hola,</p>
        <h1 className="text-2xl font-bold">{user?.username || user?.email || 'usuario'}</h1>
      </header>

      <section className="card flex items-center justify-between">
        <div>
          <p className="text-xs text-white/60">Cargas de token</p>
          <p className="text-3xl font-bold text-brand-300">{user?.tokenCharges ?? 0}</p>
        </div>
        <Link href="/wardrobe" className="btn-secondary">
          Ver armario
        </Link>
      </section>

      {pending.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/60">
            Intercambios pendientes
          </h2>
          <ul className="space-y-2">
            {pending.map((ex) => (
              <li key={ex.id} className="card flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{ex.token?.product?.name || 'Token'}</p>
                  <p className="text-xs text-white/60">De {ex.sender?.username || 'usuario'}</p>
                </div>
                <Link href={`/exchange/${ex.id}`} className="btn-primary">
                  Abrir
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/60">
          Mis últimos tokens
        </h2>
        {tokens.length === 0 ? (
          <p className="text-sm text-white/60">
            Aún no tienes tokens. Escanea un pin para registrarlo.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3">
            {tokens.slice(0, 4).map((t) => (
              <li key={t.id} className="card">
                <p className="text-sm font-semibold">{t.product?.name || 'Token'}</p>
                <p className="text-xs text-white/60 truncate">{t.tagUid}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
