'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

export default function SplashPage() {
  const router = useRouter();
  const accessToken = useSelector((s) => s.auth.accessToken);

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace(accessToken ? '/home' : '/login');
    }, 800);
    return () => clearTimeout(t);
  }, [router, accessToken]);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-gradient-to-b from-brand-700 to-ink-900">
      <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
        <span className="text-3xl font-black text-white">0 NPC</span>
      </div>
      <p className="mt-6 text-sm text-white/70">Cargando…</p>
    </div>
  );
}
