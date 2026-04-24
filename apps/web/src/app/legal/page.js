'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { policyApi } from '@/services/domainApi';

/**
 * Legal — XD `legal.png` / `politics.png` / `cookie.png`.
 * Tabs: Política de Privacidad | Política de Cookies | Aviso Legal.
 * Contenido viene del endpoint público `/api/v1/policies/:type`.
 */
const TABS = [
  { id: 'privacy', label: 'Política de Privacidad' },
  { id: 'cookies', label: 'Política de Cookies' },
  { id: 'terms', label: 'Aviso Legal' },
];

export default function LegalPage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = TABS.find((t) => t.id === params.get('tab'))?.id || 'terms';
  const [tab, setTab] = useState(initial);
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    policyApi.get(tab)
      .then(setPolicy)
      .catch(() => setPolicy(null))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <AppShell hideNav header="back" title="Información Legal" onBack={() => router.back()}>
      <div className="px-4 pt-2 pb-8">
        <p className="text-xs text-text-muted mb-3">Inicio › Información Legal</p>

        <div className="card-soft p-2 mb-4">
          <p className="px-3 pt-2 pb-1 text-sm font-bold text-night">Secciones</p>
          <ul>
            {TABS.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition ${
                    tab === t.id ? 'bg-yellow text-night font-bold' : 'text-night hover:bg-border-soft'
                  }`}
                >
                  <span className="opacity-70">◆</span>
                  <span>{t.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {loading && <p className="text-text-muted text-center text-sm py-6">Cargando…</p>}

        {policy && (
          <article className="prose prose-sm max-w-none">
            <h2 className="text-lg font-bold text-night flex items-center gap-2">
              <span>◆</span> {policy.title}
            </h2>
            <p className="text-xs text-text-muted">
              Última actualización: {new Date(policy.updatedAt || Date.now()).toLocaleDateString('es-ES')}
            </p>
            <div
              className="mt-3 text-sm text-night whitespace-pre-wrap leading-relaxed"
              // El contenido viene de seed controlado por el equipo (no input de usuario), markdown plano.
              // Para MVP renderizamos como pre-wrap; si se necesita markdown rich, añadir react-markdown.
            >
              {policy.content}
            </div>
          </article>
        )}

        {!loading && !policy && (
          <p className="text-text-muted text-center text-sm py-6">Política no disponible</p>
        )}
      </div>
    </AppShell>
  );
}
