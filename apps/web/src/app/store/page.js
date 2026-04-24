'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';
import { productsApi } from '@/services/domainApi';

export default function StorePage() {
  return (
    <AuthGuard>
      <AppShell>
        <Inner />
      </AppShell>
    </AuthGuard>
  );
}

function priceLabel(cents, currency = 'EUR') {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format((cents || 0) / 100);
}

function Inner() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    productsApi
      .list()
      .then(setProducts)
      .catch((err) => toast.error(err?.response?.data?.message || 'Error'));
  }, []);

  return (
    <div>
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Tienda</h1>
        <Link href="/cart" className="btn-secondary text-xs">
          Carrito
        </Link>
      </header>

      {products.length === 0 ? (
        <p className="text-sm text-white/60">No hay productos disponibles.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3">
          {products.map((p) => (
            <li key={p.id} className="card">
              <Link href={`/product/${p.id}`}>
                <div className="aspect-square rounded-xl bg-ink-700" />
                <p className="mt-2 text-sm font-semibold">{p.name}</p>
                <p className="text-xs text-white/60">{priceLabel(p.priceCents, p.currency)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
