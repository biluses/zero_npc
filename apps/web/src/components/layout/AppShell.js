'use client';

import BottomNavbar from './BottomNavbar';

export default function AppShell({ children, hideNav = false }) {
  return (
    <div className="min-h-[100dvh] pb-24">
      <main className="container-app py-4">{children}</main>
      {!hideNav && <BottomNavbar />}
    </div>
  );
}
