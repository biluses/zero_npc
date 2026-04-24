'use client';

import Link from 'next/link';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';

export default function CheckoutCancelPage() {
  return (
    <AuthGuard>
      <AppShell hideNav header={null}>
        <div className="px-6 py-16 flex flex-col items-center text-center min-h-[60vh] justify-center">
          <h1 className="text-2xl font-bold text-night">Pago cancelado</h1>
          <p className="mt-2 text-sm text-text-muted">No se ha cobrado nada. Puedes volver al carrito.</p>
          <Link href="/cart" className="btn-yellow mt-8 max-w-xs">
            Volver al carrito
          </Link>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
