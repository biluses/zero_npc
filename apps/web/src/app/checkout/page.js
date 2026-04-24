'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';
import { getCart, totalCents } from '@/lib/cart';
import { shopApi } from '@/services/domainApi';

const SHIPPING_CENTS = 1000; // €10 fijo MVP

/**
 * Checkout — XD `Checkout.png`.
 * Header: back + "Checkout" + close X.
 * Sections: Entregar a + Método de pago (Google Pay, Apple Pay, Tarjeta) + Footer total + CTA "Confirmar y pagar".
 *
 * Stripe lleva el flujo real: el botón crea una Checkout Session con shopApi.checkout
 * y redirige a la URL de Stripe. Las opciones Google/Apple Pay se habilitan automáticamente
 * en Stripe Checkout cuando el método está disponible.
 */
export default function CheckoutPage() {
  return (
    <AuthGuard>
      <Content />
    </AuthGuard>
  );
}

function Content() {
  const router = useRouter();
  const user = useSelector((s) => s.auth.user);
  const [items, setItems] = useState([]);
  const [method, setMethod] = useState('card');
  const [cardholder, setCardholder] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const c = getCart();
    if (c.length === 0) {
      router.replace('/cart');
      return;
    }
    setItems(c);
  }, [router]);

  const subtotal = totalCents(items);
  const total = subtotal + SHIPPING_CENTS;

  const address = user?.addressLine1
    ? {
        name: user.fullName || user.username || '',
        line: `${user.addressLine1}${user.addressLine2 ? ', ' + user.addressLine2 : ''}`,
        cp: `${user.city || ''}${user.postalCode ? ', ' + user.postalCode : ''}`,
      }
    : null;

  async function onPay() {
    setLoading(true);
    try {
      const payload = {
        items: items.map((i) => ({ productId: i.id, quantity: i.qty })),
        shippingAddress: address ? {
          name: address.name,
          line1: user.addressLine1,
          line2: user.addressLine2 || undefined,
          postalCode: user.postalCode,
          city: user.city || undefined,
          province: user.province || undefined,
          country: 'ES',
        } : undefined,
      };
      const res = await shopApi.checkout(payload);
      // Redirige a Stripe Checkout (URL firmada por backend con secret).
      window.location.href = res.url;
    } catch (err) {
      toast.error(err?.response?.data?.message || 'No se pudo iniciar el pago');
      setLoading(false);
    }
  }

  return (
    <AppShell hideNav header={null}>
      <header className="app-header-back relative">
        <button onClick={() => router.back()} className="-ml-1 p-2"><BackIcon /></button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-xl font-bold text-night">Checkout</h1>
        <button onClick={() => router.push('/store')} className="ml-auto -mr-1 h-9 w-9 rounded-full bg-surface flex items-center justify-center hover:bg-border-soft">✕</button>
      </header>

      <div className="px-4 pt-3 pb-40 space-y-5">
        <section>
          <h2 className="text-sm font-bold text-night mb-2">Entregar a</h2>
          {address ? (
            <div className="card-soft">
              <p className="font-bold text-night">{address.name}</p>
              <p className="text-sm text-text-muted">{address.line}</p>
              <p className="text-sm text-text-muted">{address.cp}</p>
              <button type="button" onClick={() => router.push('/profile')} className="link-magenta text-sm mt-2">
                Editar dirección
              </button>
            </div>
          ) : (
            <div className="card-soft text-sm text-text-muted">
              No tienes una dirección guardada.{' '}
              <button onClick={() => router.push('/profile')} className="link-magenta">Añade una</button>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm font-bold text-night mb-2">Método de pago</h2>
          <div className="space-y-2">
            <PayOption label="Google Pay" value="google" current={method} onPick={setMethod} icon="G" />
            <PayOption label="Apple Pay" value="apple" current={method} onPick={setMethod} icon="" />
            <PayOption label="Tarjeta de crédito" value="card" current={method} onPick={setMethod} icon="💳" />
          </div>

          {method === 'card' && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-sm text-night mb-1.5 px-1">Titular</label>
                <input
                  className="input-pill"
                  placeholder="Titular de la tarjeta"
                  value={cardholder}
                  onChange={(e) => setCardholder(e.target.value)}
                />
              </div>
              <p className="text-xs text-text-muted px-1">
                Los datos de tarjeta se introducen de forma segura en Stripe en el siguiente paso.
              </p>
            </div>
          )}
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md p-4 bg-white border-t border-border-soft safe-bottom">
        <div className="space-y-1 text-sm mb-2">
          <Row label="Envío" value={`€${(SHIPPING_CENTS / 100).toFixed(2)}`} />
          <Row label={`Total de artículos (${items.length})`} value={`€${(subtotal / 100).toFixed(2)}`} />
        </div>
        <div className="flex items-center justify-between font-bold text-night text-lg mb-3">
          <span>Total</span>
          <span>€{(total / 100).toFixed(2)}</span>
        </div>
        <button type="button" onClick={onPay} disabled={loading} className="btn-yellow">
          {loading ? 'Redirigiendo…' : 'Confirmar y pagar'}
        </button>
      </div>
    </AppShell>
  );
}

function PayOption({ label, value, current, onPick, icon }) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onPick(value)}
      className={`w-full flex items-center gap-3 card-soft hover:bg-border-soft transition ${
        active ? 'ring-2 ring-night' : ''
      }`}
    >
      <span className="h-9 w-9 rounded-lg bg-white flex items-center justify-center text-night text-sm font-bold border border-border-soft">{icon}</span>
      <span className="flex-1 text-left text-night">{label}</span>
      <span className={`h-5 w-5 rounded-full border-2 ${active ? 'border-night bg-night' : 'border-border-soft bg-white'} flex items-center justify-center`}>
        {active && <span className="h-2 w-2 rounded-full bg-yellow" />}
      </span>
    </button>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-muted">{label}</span>
      <span className="text-night font-medium">{value}</span>
    </div>
  );
}

function BackIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6L8 16l12 10" />
    </svg>
  );
}
