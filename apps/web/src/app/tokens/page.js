'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';
import { tokensApi, exchangesApi, notificationsApi } from '@/services/domainApi';
import { BoxTokenUp, BoxTokenDown } from '@/components/brand/icons';

/**
 * Tokens — XD `Tokens.png`.
 *
 * Header tabbed (hamburger | logo | bell).
 * Sections:
 *   - "Mis Cargas (X/3)" con barra magenta (de user.tokenCharges).
 *   - "Mis Actividades": dos cards Tokens enviados / recibidos.
 *   - "Mis Tokens": lista de productos del usuario con thumbnail + iconos.
 */
export default function TokensPage() {
  return (
    <AuthGuard>
      <TokensContent />
    </AuthGuard>
  );
}

function TokensContent() {
  const user = useSelector((s) => s.auth.user);
  const [tokens, setTokens] = useState([]);
  const [stats, setStats] = useState({ sent: 0, received: 0 });
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [tokensRes, inbox, outbox, unreadRes] = await Promise.all([
          tokensApi.list(),
          exchangesApi.list('inbox'),
          exchangesApi.list('outbox'),
          notificationsApi.unreadCount(),
        ]);
        const items = Array.isArray(tokensRes) ? tokensRes : tokensRes.items || [];
        setTokens(items);
        setStats({ sent: outbox.length || 0, received: inbox.length || 0 });
        setUnread(unreadRes.count || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Agrupa tokens por producto para el listado tipo XD (1 fila por producto).
  const grouped = tokens.reduce((acc, t) => {
    const key = t.productId;
    if (!acc[key]) acc[key] = { product: t.product, items: [] };
    acc[key].items.push(t);
    return acc;
  }, {});

  const charges = user?.tokenCharges ?? 0;
  const maxCharges = 3;
  const pct = Math.min(100, (charges / maxCharges) * 100);

  return (
    <AppShell unreadCount={unread}>
      <div className="px-4 pt-4 space-y-5">
        {/* Mis Cargas */}
        <section>
          <h2 className="text-lg font-bold text-night">Mis Cargas ({charges}/{maxCharges})</h2>
          <div className="mt-2 h-2 w-full rounded-full bg-surface overflow-hidden">
            <div className="h-full bg-magenta transition-all" style={{ width: `${pct}%` }} />
          </div>
        </section>

        {/* Mis Actividades */}
        <section>
          <h2 className="text-lg font-bold text-night mb-2">Mis Actividades</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="card-soft py-5 flex flex-col items-center">
              <BoxTokenUp size={40} />
              <div className="mt-2 text-2xl font-bold text-night">{stats.sent}</div>
              <div className="text-sm text-text-muted">Tokens enviados</div>
            </div>
            <div className="card-soft py-5 flex flex-col items-center">
              <BoxTokenDown size={40} />
              <div className="mt-2 text-2xl font-bold text-night">{stats.received}</div>
              <div className="text-sm text-text-muted">Tokens recibidos</div>
            </div>
          </div>
        </section>

        {/* Mis Tokens */}
        <section>
          <h2 className="text-lg font-bold text-night mb-2">Mis Tokens</h2>
          {Object.entries(grouped).length > 0 ? (
            <ul className="space-y-2">
              {Object.values(grouped).map(({ product, items }) => (
                <li key={product?.id || items[0]?.id}>
                  <Link
                    href={`/tokens/send?productId=${product?.id || ''}`}
                    className="card-soft flex items-center gap-3 hover:bg-border-soft transition"
                  >
                    <div className="h-14 w-14 rounded-xl bg-white overflow-hidden flex items-center justify-center shrink-0 border border-border-soft">
                      {product?.imageUrl ? (
                        <Image src={product.imageUrl} alt={product?.name || ''} width={56} height={56} className="object-cover h-full w-full" />
                      ) : (
                        <span className="text-xs text-text-muted">?</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      {items.slice(0, 5).map((t) => (
                        <BoxTokenItem key={t.id} />
                      ))}
                      {items.length > 5 && (
                        <span className="text-xs text-text-muted ml-1">+{items.length - 5}</span>
                      )}
                    </div>
                    <span className="ml-auto text-text-muted">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="card-soft p-6 text-center text-text-muted text-sm">
              Sin tokens todavía. <Link href="/scan" className="link-magenta">Escanea uno</Link>
            </div>
          )}
        </section>

        {loading && <p className="text-center text-sm text-text-muted">Cargando…</p>}
      </div>
    </AppShell>
  );
}

function BoxTokenItem() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="#101010" aria-hidden>
      <path d="M16 4l11 5.5v13L16 28 5 22.5v-13L16 4z" />
      <circle cx="16" cy="11" r="2.2" fill="#FF00F2" />
    </svg>
  );
}
