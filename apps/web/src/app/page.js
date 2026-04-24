'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Logo from '@/components/brand/Logo';

/**
 * Splash – 1 (XD).
 * Fondo negro full, logo Zero NPC centrado, "comparte conexión" debajo.
 * Tras 1.6s redirect: /profile si autenticado, /intro si no.
 *
 * No usa AppShell — pantalla full-bleed sin nav ni header.
 */
export default function SplashPage() {
  const router = useRouter();
  const accessToken = useSelector((s) => s.auth.accessToken);

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace(accessToken ? '/profile' : '/intro');
    }, 1600);
    return () => clearTimeout(t);
  }, [router, accessToken]);

  return (
    <div className="min-h-[100dvh] bg-night flex flex-col items-center justify-center px-6">
      <div className="animate-fade-in-up flex flex-col items-center">
        <Logo variant="light" width={220} height={64} priority />
        <p className="mt-8 text-base text-white/80 tracking-wide">comparte conexión</p>
      </div>
    </div>
  );
}
