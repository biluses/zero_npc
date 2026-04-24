'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';
import { productsApi } from '@/services/domainApi';
import { addToCart } from '@/lib/cart';

function priceLabel(cents, currency = 'EUR') {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format((cents || 0) / 100);
}

export default function ProductPage() {
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
  const [p, setP] = useState(null);

  useEffect(() => {
    productsApi.byId(id).then(setP).catch(() => toast.error('Error cargando producto'));
  }, [id]);

  if (!p) return <p>Cargando…</p>;

  function addAndGo() {
    addToCart({ productId: p.id, quantity: 1, name: p.name, priceCents: p.priceCents, currency: p.currency });
    toast.success('Añadido al carrito');
  }

  return (
    <div className="space-y-4">
      <div className="aspect-square rounded-xl2 bg-ink-700" />
      <h1 className="text-xl font-bold">{p.name}</h1>
      <p className="text-lg text-brand-300">{priceLabel(p.priceCents, p.currency)}</p>
      <p className="text-sm text-white/70">{p.description}</p>

      <div className="flex gap-2">
        <button className="btn-secondary flex-1" onClick={addAndGo}>
          Añadir al carrito
        </button>
        <Link href="/cart" className="btn-primary flex-1 text-center">
          Ver carrito
        </Link>
      </div>
    </div>
  );
}
