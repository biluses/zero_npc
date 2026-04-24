'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '@/services/authApi';

function VerifyOtpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get('email') || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.verifyOtp({ email, otp });
      toast.success('Email verificado. Inicia sesión.');
      router.replace('/login');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Código inválido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-app py-10">
      <h1 className="text-2xl font-bold">Verifica tu email</h1>
      <p className="mt-2 text-sm text-white/60">Introduce el código enviado a {email}.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input
          className="input text-center text-2xl tracking-[0.3em]"
          inputMode="numeric"
          pattern="\d{4,8}"
          placeholder="000000"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? 'Verificando…' : 'Verificar'}
        </button>
      </form>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpForm />
    </Suspense>
  );
}
