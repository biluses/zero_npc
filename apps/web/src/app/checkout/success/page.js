'use client';

import Link from 'next/link';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';

export default function CheckoutSuccessPage() {
  return (
    <AuthGuard>
      <AppShell hideNav header={null}>
        <div className="px-6 py-16 flex flex-col items-center text-center min-h-[60vh] justify-center">
          <div className="h-20 w-20 rounded-full bg-yellow flex items-center justify-center text-night text-4xl font-bold">
            ✓
          </div>
          <h1 className="mt-6 text-2xl font-bold text-night">¡Pago completado!</h1>
          <p className="mt-2 text-sm text-text-muted">
            Recibirás un email con los detalles de tu pedido.
          </p>
          <Link href="/profile" className="btn-yellow mt-8 max-w-xs">
            Volver al inicio
          </Link>
          <Link href="/orders" className="link-magenta mt-3 text-sm">
            Ver mis pedidos
          </Link>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
