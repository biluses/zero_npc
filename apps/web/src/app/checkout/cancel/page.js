'use client';

import Link from 'next/link';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';

export default function CheckoutCancelPage() {
  return (
    <AuthGuard>
      <AppShell>
        <div className="card text-center">
          <h1 className="text-xl font-bold">Pago cancelado</h1>
          <p className="mt-2 text-sm text-white/70">No se ha cobrado nada. Puedes volver al carrito.</p>
          <Link href="/cart" className="btn-primary mt-6 inline-block">
            Volver al carrito
          </Link>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
