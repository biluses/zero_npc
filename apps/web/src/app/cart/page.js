'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';
import { getCart, removeFromCart, totalCents, clearCart } from '@/lib/cart';
import { shopApi } from '@/services/domainApi';

function priceLabel(cents, currency = 'EUR') {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format((cents || 0) / 100);
}

export default function CartPage() {
  return (
    <AuthGuard>
      <AppShell>
        <Inner />
      </AppShell>
    </AuthGuard>
  );
}

function Inner() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setItems(getCart());
  }, []);

  function remove(id) {
    setItems(removeFromCart(id));
  }

  async function checkout() {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const payload = { items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })) };
      const data = await shopApi.checkout(payload);
      clearCart();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('No se pudo crear la sesión de pago');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al pagar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Carrito</h1>

      {items.length === 0 ? (
        <p className="text-sm text-white/60">Tu carrito está vacío.</p>
      ) : (
        <>
          <ul className="space-y-2">
            {items.map((i) => (
              <li key={i.productId} className="card flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{i.name}</p>
                  <p className="text-xs text-white/60">
                    {i.quantity} × {priceLabel(i.priceCents, i.currency)}
                  </p>
                </div>
                <button className="btn-ghost text-xs" onClick={() => remove(i.productId)}>
                  Quitar
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-white/70">Total</p>
            <p className="text-lg font-bold">{priceLabel(totalCents(items))}</p>
          </div>

          <button className="btn-primary mt-4 w-full" disabled={loading} onClick={checkout}>
            {loading ? 'Procesando…' : 'Pagar con Stripe'}
          </button>
        </>
      )}
    </div>
  );
}
