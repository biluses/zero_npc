'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { productsApi, notificationsApi } from '@/services/domainApi';
import { Handshake } from '@/components/brand/icons';

/**
 * Store — XD `Store – 1.png`.
 *
 * Header personalizado: shapes-icon (categorías) | "Store" | carrito + lupa.
 * Hero Swiper con productos destacados (isPin=true).
 * Grid 2 cols categorías.
 * Footer card "Colaborar con nosotros".
 */
export default function StorePage() {
  return (
    <AuthGuard>
      <StoreContent />
    </AuthGuard>
  );
}

function StoreContent() {
  const router = useRouter();
  const [pinned, setPinned] = useState([]);
  const [products, setProducts] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [allProducts, pinnedProducts, unreadRes] = await Promise.all([
          productsApi.list({ limit: 20 }),
          productsApi.list({ isPin: 'true', limit: 6 }),
          notificationsApi.unreadCount(),
        ]);
        setProducts(allProducts);
        setPinned(pinnedProducts);
        setUnread(unreadRes.count || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AppShell header={null} unreadCount={unread}>
      <header className="app-header-tabbed">
        <button type="button" aria-label="Categorías" className="-ml-1 p-2 text-night">
          <ShapesIcon />
        </button>
        <h1 className="app-title">Store</h1>
        <div className="flex items-center -mr-1">
          <Link href="/cart" aria-label="Carrito" className="p-2 text-night hover:opacity-70">
            <CartIcon />
          </Link>
          <button type="button" aria-label="Buscar" className="p-2 text-night hover:opacity-70">
            <SearchIcon />
          </button>
        </div>
      </header>

      {/* Hero */}
      <div className="px-4 mt-2">
        {pinned.length > 0 ? (
          <Swiper
            modules={[Pagination, Autoplay]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 4500, disableOnInteraction: false }}
            slidesPerView={1}
            className="rounded-2xl bg-surface !pb-8"
          >
            {pinned.map((p) => (
              <SwiperSlide key={p.id}>
                <Link href={`/product/${p.id}`} className="block aspect-[4/4] flex items-center justify-center bg-surface rounded-2xl">
                  {p.imageUrl ? (
                    <Image src={p.imageUrl} alt={p.name} width={400} height={400} className="object-contain h-full" />
                  ) : (
                    <span className="text-text-muted">{p.name}</span>
                  )}
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="card-soft aspect-[4/3] flex items-center justify-center text-text-muted text-sm">
            Aún no hay productos destacados
          </div>
        )}
      </div>

      {/* Grid categorías/productos */}
      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/product/${p.id}`}
            className="card-soft p-2 hover:bg-border-soft transition"
          >
            <div className="aspect-square w-full bg-white rounded-xl overflow-hidden flex items-center justify-center">
              {p.imageUrl ? (
                <Image src={p.imageUrl} alt={p.name} width={200} height={200} className="object-contain h-full" />
              ) : (
                <span className="text-text-muted text-xs">{p.name}</span>
              )}
            </div>
            <p className="mt-2 text-center font-bold text-night line-clamp-2">{p.name}</p>
          </Link>
        ))}

        {!loading && products.length === 0 && (
          <p className="col-span-2 text-center text-text-muted text-sm py-6">Aún no hay productos en la tienda</p>
        )}
      </div>

      {/* Footer Colaborar */}
      <div className="px-4 mt-6 mb-2">
        <a
          href="mailto:hola@zero-npc.com?subject=Quiero%20colaborar"
          className="card-soft p-6 flex flex-col items-center text-center hover:bg-border-soft transition"
        >
          <Handshake size={56} />
          <p className="mt-3 font-bold text-night">Colaborar con nosotros</p>
        </a>
      </div>
    </AppShell>
  );
}

function ShapesIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <polygon points="6,3 11,12 1,12" />
      <circle cx="17" cy="7" r="4" />
      <rect x="13" y="14" width="8" height="8" rx="1" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
