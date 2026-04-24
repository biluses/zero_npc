'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';
import { getCart, removeFromCart, setCart, clearCart, totalCents } from '@/lib/cart';

/**
 * Cart — XD `Cart.png`.
 * "Carrito" centrado + carrito icon con badge magenta + close X.
 * Lista items + selector cantidad + precio. Footer total + CTA amarilla.
 */
export default function CartPage() {
  return (
    <AuthGuard>
      <Content />
    </AuthGuard>
  );
}

function Content() {
  const router = useRouter();
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getCart());
  }, []);

  function setQty(id, qty) {
    const next = items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i));
    setItems(next);
    setCart(next);
  }
  function removeItem(id) {
    removeFromCart(id);
    setItems(getCart());
  }
  function clearAll() {
    clearCart();
    setItems([]);
  }

  const total = totalCents(items) / 100;

  return (
    <AppShell hideNav header={null}>
      <header className="app-header-back relative">
        <div className="w-9" />
        <h1 className="absolute left-1/2 -translate-x-1/2 text-xl font-bold text-night">Carrito</h1>
        <div className="ml-auto flex items-center gap-2">
          <span className="relative">
            <CartIcon />
            <span className="absolute -top-1 -right-2 inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-yellow text-[10px] font-bold text-night">
              {items.length}
            </span>
          </span>
          <button
            type="button"
            onClick={() => router.push('/store')}
            aria-label="Cerrar"
            className="ml-2 h-9 w-9 rounded-full bg-surface flex items-center justify-center text-night hover:bg-border-soft"
          >
            ✕
          </button>
        </div>
      </header>

      <div className="px-4 pt-3 pb-32">
        {items.length > 0 && (
          <button type="button" onClick={clearAll} className="link-magenta text-sm mb-3">
            Eliminar todo
          </button>
        )}

        {items.length === 0 ? (
          <p className="text-text-muted text-sm py-8 text-center">El carrito está vacío</p>
        ) : (
          <ul className="divide-y divide-border-soft">
            {items.map((i) => (
              <li key={i.id} className="flex items-center gap-3 py-4">
                <div className="h-16 w-16 rounded-xl bg-surface overflow-hidden flex items-center justify-center shrink-0">
                  {i.imageUrl ? (
                    <Image src={i.imageUrl} alt={i.name} width={64} height={64} className="object-cover h-full w-full" />
                  ) : (
                    <span className="text-text-muted text-xs">?</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-night truncate">{i.name}</p>
                  <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-border-soft px-2">
                    <button type="button" onClick={() => setQty(i.id, i.qty - 1)} className="h-7 w-7 text-night">−</button>
                    <span className="w-5 text-center text-sm font-medium">{i.qty}</span>
                    <button type="button" onClick={() => setQty(i.id, i.qty + 1)} className="h-7 w-7 text-night">+</button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-night">€{((i.priceCents * i.qty) / 100).toFixed(2)}</p>
                  <button type="button" onClick={() => removeItem(i.id)} className="text-xs text-text-muted hover:text-reject">
                    Quitar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md p-4 bg-white border-t border-border-soft safe-bottom">
        <div className="flex items-center justify-between mb-3">
          <span className="text-text-muted">Total de artículos ({items.length})</span>
          <span className="text-xl font-bold text-night">€{total.toFixed(2)}</span>
        </div>
        <button
          type="button"
          disabled={items.length === 0}
          onClick={() => router.push('/checkout')}
          className="btn-yellow"
        >
          Realizar pago ahora
        </button>
      </div>
    </AppShell>
  );
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
    </svg>
  );
}
