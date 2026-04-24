'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import BottomNavbar from './BottomNavbar';
import Drawer from './Drawer';
import { AppHeaderTabbed, AppHeaderBack } from './AppHeader';

/**
 * AppShell — wrapper estándar para las páginas principales del XD.
 *
 * Props:
 *  - children
 *  - hideNav: oculta BottomNavbar (default false)
 *  - header: 'tabbed' | 'back' | null  (qué cabecera renderizar)
 *  - title: string (para back header)
 *  - headerAction: ReactNode (acción derecha del back header)
 *  - unreadCount: number (badge campana del tabbed)
 *  - unreadChatCount: number (badge chat del drawer)
 *  - onBack(): override del back
 *
 * El Drawer se incluye y gestiona aquí: cualquier AppHeaderTabbed dispara su apertura.
 * Para páginas sin BottomNavbar (auth/splash/intro), usar `<AppShell hideNav header={null}>`.
 */
export default function AppShell({
  children,
  hideNav = false,
  header = 'tabbed',
  title = '',
  headerAction = null,
  unreadCount: unreadProp = null,
  unreadChatCount = 0,
  onBack,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Si no se pasa explícitamente, usa el contador global del Redux store.
  const reduxUnread = useSelector((s) => s.notifications?.unreadCount || 0);
  const unreadCount = unreadProp != null ? unreadProp : reduxUnread;

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col mx-auto max-w-md w-full">
      {header === 'tabbed' && (
        <AppHeaderTabbed
          onMenu={() => setDrawerOpen(true)}
          unreadCount={unreadCount}
        />
      )}
      {header === 'back' && (
        <AppHeaderBack title={title} action={headerAction} onBack={onBack} />
      )}

      <main className={`flex-1 ${hideNav ? '' : 'pb-28'}`}>{children}</main>

      {!hideNav && <BottomNavbar />}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        unreadChatCount={unreadChatCount}
      />
    </div>
  );
}
