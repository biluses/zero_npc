'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';
import { productsApi } from '@/services/domainApi';
import { addToCart, getCart } from '@/lib/cart';
import { BoxToken } from '@/components/brand/icons';

/**
 * Store Product — XD `Store Product.png`.
 * Header back + "Store" + carrito + lupa.
 * Imagen producto + título split + cards físicos/virtuales + precio + colores + tallas + CTA amarilla.
 */

const COLORS = [
  { hex: '#9DAE9C', label: 'Sage' },
  { hex: '#101010', label: 'Negro' },
  { hex: '#F1EEF7', label: 'Blanco' },
  { hex: '#F5C7CB', label: 'Rosa' },
];
const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

export default function ProductPage() {
  return (
    <AuthGuard>
      <Inner />
    </AuthGuard>
  );
}

function Inner() {
  const router = useRouter();
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [color, setColor] = useState(COLORS[0].hex);
  const [size, setSize] = useState('M');
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    productsApi.byId(id).then(setP).catch(() => toast.error('Error cargando producto'));
    setCartCount(getCart().length);
  }, [id]);

  function onAdd() {
    addToCart({
      id: p.id,
      name: p.name,
      priceCents: p.priceCents,
      currency: p.currency,
      imageUrl: p.imageUrl,
      color,
      size,
      qty: 1,
    });
    setCartCount(getCart().length);
    toast.success('Añadido al carrito');
  }

  if (!p) {
    return (
      <AppShell hideNav header="back" title="Store">
        <p className="text-text-muted text-center py-8">Cargando…</p>
      </AppShell>
    );
  }

  // Split nombre: "Sudadera Classic" → "Sudadera" / "Classic"
  const [type, ...rest] = p.name.split(' ');
  const name = rest.join(' ') || p.name;

  return (
    <AppShell
      hideNav
      header="back"
      title="Store"
      headerAction={
        <Link href="/cart" aria-label="Carrito" className="relative p-2">
          <CartIcon />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-yellow text-[10px] font-bold text-night">
              {cartCount}
            </span>
          )}
        </Link>
      }
    >
      <div className="px-4 pt-2 pb-32">
        <div className="aspect-square w-full rounded-2xl bg-surface overflow-hidden flex items-center justify-center">
          {p.imageUrl ? (
            <Image src={p.imageUrl} alt={p.name} width={400} height={400} className="object-contain h-full" priority />
          ) : (
            <span className="text-text-muted">Sin imagen</span>
          )}
        </div>

        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xl text-night">{type}</p>
            <p className="text-2xl font-extrabold text-night">{name}</p>
          </div>
          <div className="flex gap-3">
            <BadgeBox label="físicos" amount="+2" dotColor="#EEFF00" />
            <BadgeBox label="virtuales" amount="+1" dotColor="#FF00F2" />
          </div>
        </div>

        <p className="mt-3 text-2xl font-bold text-night underline decoration-2 underline-offset-2 decoration-night/30">
          €{((p.priceCents || 0) / 100).toFixed(2)}
        </p>

        <section className="mt-5">
          <div className="flex items-center gap-3">
            {COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setColor(c.hex)}
                aria-label={c.label}
                className={`h-9 w-9 rounded-full border-2 ${color === c.hex ? 'border-night' : 'border-border-soft'}`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </section>

        <section className="mt-5">
          <div className="flex items-center gap-2">
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`min-w-[48px] h-10 rounded-xl border font-medium transition ${
                  size === s ? 'border-night bg-night text-white' : 'border-border-soft text-night hover:bg-surface'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        {p.description && (
          <p className="mt-5 text-sm text-text-muted whitespace-pre-wrap">{p.description}</p>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md p-4 bg-white border-t border-border-soft safe-bottom">
        <button type="button" onClick={onAdd} className="btn-yellow">
          Añadir al carrito
        </button>
      </div>
    </AppShell>
  );
}

function BadgeBox({ label, amount, dotColor }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <BoxToken size={36} />
        {/* Override del dot color */}
        <span className="absolute" style={{ top: 6, left: 11, width: 9, height: 9, borderRadius: 9999, backgroundColor: dotColor }} aria-hidden />
        <span className="absolute -top-1 -right-2 inline-flex items-center justify-center h-5 px-1 rounded-full bg-night text-[10px] font-bold text-yellow">
          {amount}
        </span>
      </div>
      <span className="mt-1 text-xs text-text-muted">{label}</span>
    </div>
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
