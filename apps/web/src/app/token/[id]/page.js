'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-toastify';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';
import { tokensApi } from '@/services/domainApi';
import { BoxToken } from '@/components/brand/icons';

/**
 * Token detail — reutiliza diseño wardrobe item + acceso rápido a "Enviar token".
 */
export default function TokenDetailsPage() {
  return (
    <AuthGuard>
      <Inner />
    </AuthGuard>
  );
}

function Inner() {
  const router = useRouter();
  const { id } = useParams();
  const [token, setToken] = useState(null);

  useEffect(() => {
    tokensApi.byId(id).then(setToken).catch((err) => toast.error(err?.response?.data?.message || 'Error'));
  }, [id]);

  if (!token) {
    return (
      <AppShell hideNav header="back" title="Detalle">
        <p className="text-text-muted text-sm py-8 text-center">Cargando…</p>
      </AppShell>
    );
  }

  const product = token.product || {};

  return (
    <AppShell hideNav header="back" title="Detalle del token">
      <div className="px-4 pt-2 pb-32 space-y-4">
        <div className="aspect-square w-full rounded-2xl bg-surface overflow-hidden flex items-center justify-center">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} width={400} height={400} className="object-contain h-full" priority />
          ) : (
            <BoxToken size={120} />
          )}
        </div>

        <div>
          <p className="text-2xl font-extrabold text-night">{product.name || 'Token'}</p>
          <p className="text-xs text-text-muted mt-1">UID: {token.tagUid}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="card-soft text-center py-3">
            <p className="text-xs text-text-muted">Intercambios</p>
            <p className="text-xl font-bold text-night">{token.exchangeCount || 0}</p>
          </div>
          <div className="card-soft text-center py-3">
            <p className="text-xs text-text-muted">Estado</p>
            <p className="text-sm font-bold text-night">{token.isLocked ? 'Bloqueado' : 'Disponible'}</p>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md p-4 bg-white border-t border-border-soft safe-bottom">
        <Link href={`/tokens/send?productId=${product.id || ''}`} className="btn-yellow text-center">
          Enviar token
        </Link>
      </div>
    </AppShell>
  );
}
