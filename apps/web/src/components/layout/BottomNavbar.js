'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  ProfileIcon,
  CommunityIcon,
  TokenBoxIcon,
  StoreIcon,
  QrIcon,
} from '@/components/brand/icons';

/**
 * BottomNavbar fiel al XD `user-profile-structure-with-bottom-app-sticky-bar.png`.
 * 5 slots: Yo | Comunidad | FAB QR (negro/amarillo) → Scan | Tokens | Store
 *
 * El FAB central es elevado, fondo negro circular grande con icono QR amarillo.
 */

const tabs = [
  { href: '/profile', label: 'Yo', Icon: ProfileIcon, matches: ['/profile', '/wardrobe', '/friends'] },
  { href: '/community', label: 'Comunidad', Icon: CommunityIcon, matches: ['/community', '/post'] },
  { href: '/scan', label: 'Escanear', Icon: QrIcon, primary: true, matches: ['/scan'] },
  { href: '/tokens', label: 'Tokens', Icon: TokenBoxIcon, matches: ['/tokens'] },
  { href: '/store', label: 'Store', Icon: StoreIcon, matches: ['/store', '/cart', '/checkout', '/product'] },
];

function isActive(pathname, t) {
  if (!pathname) return false;
  if (pathname === t.href) return true;
  return t.matches.some((m) => pathname === m || pathname.startsWith(`${m}/`));
}

export default function BottomNavbar() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Navegación principal">
      {tabs.map((t) => {
        const active = isActive(pathname, t);
        if (t.primary) {
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-label={t.label}
              className="-translate-y-3 flex h-16 w-16 items-center justify-center rounded-full bg-night shadow-lg active:scale-95 transition"
            >
              <t.Icon size={32} color="#EEFF00" />
            </Link>
          );
        }
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-label={t.label}
            aria-current={active ? 'page' : undefined}
            className={clsx(
              'flex flex-col items-center gap-1 px-2 py-2 text-[11px] font-medium transition',
              active ? 'text-night' : 'text-text-muted',
            )}
          >
            <t.Icon size={26} className="shrink-0" />
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
