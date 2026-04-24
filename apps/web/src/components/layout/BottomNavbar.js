'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const tabs = [
  { href: '/home', label: 'Inicio', icon: '🏠' },
  { href: '/wardrobe', label: 'Armario', icon: '👕' },
  { href: '/scan', label: 'Escanear', icon: '📡', primary: true },
  { href: '/store', label: 'Tienda', icon: '🛍️' },
  { href: '/profile', label: 'Perfil', icon: '👤' },
];

export default function BottomNavbar() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-700 bg-ink-900/95 backdrop-blur safe-bottom">
      <ul className="mx-auto flex max-w-md items-center justify-between px-3 py-2">
        {tabs.map((t) => {
          const active = pathname === t.href || pathname?.startsWith(`${t.href}/`);
          if (t.primary) {
            return (
              <li key={t.href}>
                <Link
                  href={t.href}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-brand"
                  aria-label={t.label}
                >
                  <span className="text-2xl">{t.icon}</span>
                </Link>
              </li>
            );
          }
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                className={clsx(
                  'flex flex-col items-center gap-0.5 px-3 py-2 text-[11px]',
                  active ? 'text-brand-300' : 'text-white/60',
                )}
              >
                <span className="text-lg leading-none">{t.icon}</span>
                <span>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
