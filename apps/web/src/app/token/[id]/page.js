'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';
import { tokensApi, usersApi, exchangesApi } from '@/services/domainApi';

export default function TokenDetailsPage() {
  return (
    <AuthGuard>
      <AppShell>
        <Inner />
      </AppShell>
    </AuthGuard>
  );
}

function Inner() {
  const { id } = useParams();
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    tokensApi.byId(id).then(setToken).catch((err) => toast.error(err?.response?.data?.message || 'Error'));
  }, [id]);

  async function doSearch(e) {
    e.preventDefault();
    if (q.length < 2) return;
    try {
      const r = await usersApi.search(q);
      setResults(r);
    } catch (err) {
      toast.error('Error buscando');
    }
  }

  async function initiateExchange(recipientId) {
    try {
      const ex = await exchangesApi.initiate({ tokenId: id, recipientId });
      toast.success('Intercambio iniciado');
      router.push(`/exchange/${ex.id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error iniciando intercambio');
    }
  }

  if (!token) return <p>Cargando…</p>;

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="aspect-square rounded-xl bg-ink-700" />
        <h1 className="mt-3 text-lg font-bold">{token.product?.name}</h1>
        <p className="text-xs text-white/60">UID: {token.tagUid}</p>
        <p className="mt-2 text-xs text-white/60">Intercambios: {token.exchangeCount}</p>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/60">
          Enviar a un usuario
        </h2>
        <form onSubmit={doSearch} className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Username o email"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn-secondary">Buscar</button>
        </form>

        <ul className="mt-3 space-y-2">
          {results.map((u) => (
            <li key={u.id} className="card flex items-center justify-between">
              <p className="text-sm">{u.username || u.id}</p>
              <button className="btn-primary text-xs" onClick={() => initiateExchange(u.id)}>
                Enviar
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
