'use client';

import Link from 'next/link';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';

export default function CheckoutSuccessPage() {
  return (
    <AuthGuard>
      <AppShell>
        <div className="card text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/20 text-3xl">
            ✓
          </div>
          <h1 className="text-xl font-bold">¡Pago completado!</h1>
          <p className="mt-2 text-sm text-white/70">
            Recibirás un email con los detalles de tu pedido.
          </p>
          <Link href="/home" className="btn-primary mt-6 inline-block">
            Volver al inicio
          </Link>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
