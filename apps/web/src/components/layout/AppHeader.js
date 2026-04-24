'use client';

import Link from 'next/link';
import Logo from '@/components/brand/Logo';

/**
 * Header tabbed para pantallas con BottomNavbar (Yo, Comunidad, Tokens, Store).
 * Fiel al XD: [hamburger | logo Zero NPC | bell con dot magenta si hay no leídas]
 *
 * Props:
 *  - onMenu(): abrir Drawer
 *  - onBell(): navegar a notifications (default: link a /notifications)
 *  - unreadCount: number — si > 0 muestra dot magenta sobre la campana
 */
export function AppHeaderTabbed({ onMenu, onBell, unreadCount = 0 }) {
  return (
    <header className="app-header-tabbed">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Abrir menú"
        className="-ml-1 p-2 text-night hover:opacity-70 transition"
      >
        <HamburgerIcon />
      </button>

      <Logo variant="dark" width={88} height={26} priority />

      {onBell ? (
        <button
          type="button"
          onClick={onBell}
          aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ''}`}
          className="relative -mr-1 p-2 text-night hover:opacity-70 transition"
        >
          <BellIcon />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1.5 h-2.5 w-2.5 rounded-full bg-magenta ring-2 ring-white" />
          )}
        </button>
      ) : (
        <Link
          href="/notifications"
          aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ''}`}
          className="relative -mr-1 p-2 text-night hover:opacity-70 transition"
        >
          <BellIcon />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1.5 h-2.5 w-2.5 rounded-full bg-magenta ring-2 ring-white" />
          )}
        </Link>
      )}
    </header>
  );
}

/**
 * Header back para pantallas standalone (Notifications, Wardrobe, Cart, Send Token, Friends, etc.).
 * Fiel al XD: [← back-arrow | título centrado bold | (action opcional: cart, close, etc.)]
 *
 * Props:
 *  - title: string
 *  - onBack(): default router.back()
 *  - action: ReactNode opcional a la derecha (ej. <CartButton/>)
 */
export function AppHeaderBack({ title, onBack, action = null }) {
  function handleBack() {
    if (onBack) {
      onBack();
      return;
    }
    if (typeof window !== 'undefined') window.history.back();
  }

  return (
    <header className="app-header-back relative">
      <button
        type="button"
        onClick={handleBack}
        aria-label="Volver"
        className="-ml-1 p-2 text-night hover:opacity-70 transition"
      >
        <BackArrowIcon />
      </button>

      <h1 className="absolute left-1/2 -translate-x-1/2 text-xl font-bold text-night">
        {title}
      </h1>

      <div className="ml-auto flex items-center gap-2">{action}</div>
    </header>
  );
}

function HamburgerIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a1 1 0 011 1v.6a7 7 0 016 6.9v3.5l1.5 2.5a1 1 0 01-.86 1.5H4.36a1 1 0 01-.86-1.5L5 14V10.5a7 7 0 016-6.9V3a1 1 0 011-1zM10 20h4a2 2 0 11-4 0z" />
    </svg>
  );
}

function BackArrowIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6L8 16l12 10" />
    </svg>
  );
}
