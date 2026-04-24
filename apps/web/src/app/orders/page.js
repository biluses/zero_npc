'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';
import { shopApi } from '@/services/domainApi';

function priceLabel(cents, currency = 'EUR') {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format((cents || 0) / 100);
}

const STATUS_LABEL = {
  pending: 'Pendiente',
  paid: 'Pagado',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
};

export default function OrdersPage() {
  return (
    <AuthGuard>
      <Inner />
    </AuthGuard>
  );
}

function Inner() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    shopApi
      .orders()
      .then(setOrders)
      .catch((err) => toast.error(err?.response?.data?.message || 'Error'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell hideNav header="back" title="Mis pedidos">
      <div className="px-4 pt-2 pb-8">
        {orders.length === 0 ? (
          <p className="text-text-muted text-sm py-8 text-center">
            {loading ? 'Cargando…' : 'Aún no tienes pedidos.'}
          </p>
        ) : (
          <ul className="space-y-3">
            {orders.map((o) => (
              <li key={o.id} className="card-soft">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-text-muted">{new Date(o.createdAt).toLocaleString('es-ES')}</p>
                  <span className="rounded-full bg-white px-3 py-0.5 text-xs font-bold text-night">{STATUS_LABEL[o.status] || o.status}</span>
                </div>
                <ul className="mt-2 space-y-1 text-sm text-night">
                  {(o.items || []).map((i) => (
                    <li key={i.id}>
                      {i.quantity} × {i.product?.name}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-right font-bold text-night">
                  {priceLabel(o.totalCents, o.currency)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
