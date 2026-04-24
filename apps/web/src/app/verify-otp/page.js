'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { toast } from 'react-toastify';
import { authApi } from '@/services/authApi';
import AppShell from '@/components/layout/AppShell';

function VerifyOtpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get('email') || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (otp.length < 4) return toast.error('Introduce el código completo');
    setLoading(true);
    try {
      await authApi.verifyOtp({ email, otp });
      toast.success('Email verificado. Inicia sesión para continuar.');
      router.replace('/login');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Código inválido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-6 pt-4">
      <p className="text-text-muted text-sm">
        Introduce el código que hemos enviado a <span className="text-night font-medium">{email}</span>.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <input
          className="input-pill text-center text-2xl tracking-[0.4em] font-bold py-5"
          inputMode="numeric"
          pattern="\d{4,8}"
          maxLength={8}
          placeholder="000000"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          autoComplete="one-time-code"
          required
        />
        <button type="submit" disabled={loading} className="btn-yellow">
          {loading ? 'Verificando…' : 'Verificar'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-text-muted">
        ¿No te ha llegado?{' '}
        <button
          type="button"
          onClick={() => toast('Vuelve a registrarte si el código expiró', { icon: 'ℹ️' })}
          className="link-magenta"
        >
          Reenviar
        </button>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <AppShell hideNav header="back" title="Verifica tu email">
      <Suspense>
        <VerifyOtpForm />
      </Suspense>
    </AppShell>
  );
}
