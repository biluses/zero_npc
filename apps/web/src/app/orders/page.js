'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';
import { shopApi } from '@/services/domainApi';

function priceLabel(cents, currency = 'EUR') {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format((cents || 0) / 100);
}

export default function OrdersPage() {
  return (
    <AuthGuard>
      <AppShell>
        <Inner />
      </AppShell>
    </AuthGuard>
  );
}

function Inner() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    shopApi
      .orders()
      .then(setOrders)
      .catch((err) => toast.error(err?.response?.data?.message || 'Error'));
  }, []);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Mis pedidos</h1>
      {orders.length === 0 ? (
        <p className="text-sm text-white/60">Aún no tienes pedidos.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="card">
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/60">{new Date(o.createdAt).toLocaleString('es-ES')}</p>
                <span className="rounded-full bg-ink-700 px-2 py-0.5 text-xs">{o.status}</span>
              </div>
              <ul className="mt-2 space-y-1 text-sm">
                {(o.items || []).map((i) => (
                  <li key={i.id}>
                    {i.quantity} × {i.product?.name}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-right font-semibold">
                {priceLabel(o.totalCents, o.currency)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
