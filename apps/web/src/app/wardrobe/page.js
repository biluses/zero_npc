'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';
import { tokensApi } from '@/services/domainApi';

/**
 * Wardrobe — XD `Me - Wardrobe.png`.
 * Header back + "Armario".
 * Grid 2 cols con cards: imagen + tipo + nombre bold (ej. "Camiseta" / "Ghost").
 */
export default function WardrobePage() {
  return (
    <AuthGuard>
      <WardrobeContent />
    </AuthGuard>
  );
}

function WardrobeContent() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await tokensApi.list();
        setTokens(Array.isArray(res) ? res : res.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AppShell header="back" title="Armario">
      <div className="px-4 pt-2 grid grid-cols-2 gap-3">
        {tokens.map((t) => {
          const product = t.product || {};
          const [type, ...nameParts] = (product.name || 'Artículo').split(' ');
          const name = nameParts.join(' ') || product.name || '';
          return (
            <Link
              href={`/token/${t.id}`}
              key={t.id}
              className="block hover:opacity-90 transition"
            >
              <div className="aspect-square w-full rounded-xl overflow-hidden bg-surface flex items-center justify-center">
                {product.imageUrl ? (
                  <Image src={product.imageUrl} alt={product.name || ''} width={200} height={200} className="object-cover h-full w-full" />
                ) : (
                  <span className="text-text-muted text-xs">Sin imagen</span>
                )}
              </div>
              <div className="mt-2 px-1">
                <p className="text-sm text-night">{type}</p>
                <p className="text-base font-bold text-night line-clamp-1">{name}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {!loading && tokens.length === 0 && (
        <p className="text-center text-text-muted text-sm py-8 px-4">
          Aún no tienes tokens. Escanea tu primera prenda en{' '}
          <Link href="/scan" className="link-magenta">/scan</Link>.
        </p>
      )}
    </AppShell>
  );
}
