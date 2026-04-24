'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { authApi } from '@/services/authApi';
import AppShell from '@/components/layout/AppShell';

/**
 * Forgot password — solicita el email y manda OTP de reset.
 * Sigue el design system XD (header back + título + input pill + CTA amarilla).
 * Tras éxito redirige a /reset-password?email=... para introducir OTP + nueva pass.
 */
export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgot(email.trim().toLowerCase());
      toast.success('Si el email existe, hemos enviado un código');
      router.push(`/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al solicitar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell hideNav header="back" title="Recuperar contraseña">
      <div className="px-6 pt-4">
        <p className="text-text-muted text-sm">
          Introduce tu email y te enviaremos un código para restablecer tu contraseña.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm text-night mb-1.5 px-1">Correo electrónico</label>
            <input
              className="input-pill"
              type="email"
              placeholder="myemail@gmail.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-yellow">
            {loading ? 'Enviando…' : 'Enviar código'}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
