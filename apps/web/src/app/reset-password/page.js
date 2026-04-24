'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { toast } from 'react-toastify';
import { authApi } from '@/services/authApi';
import PasswordInput from '@/components/forms/PasswordInput';
import AppShell from '@/components/layout/AppShell';

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialEmail = params.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (password.length < 8) return toast.error('La contraseña debe tener al menos 8 caracteres');
    if (password !== confirm) return toast.error('Las contraseñas no coinciden');

    setLoading(true);
    try {
      await authApi.reset({ email: email.trim().toLowerCase(), otp, password });
      toast.success('Contraseña restablecida. Inicia sesión.');
      router.replace('/login');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al restablecer');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-6 pt-4">
      <p className="text-text-muted text-sm">
        Introduce el código recibido por email y tu nueva contraseña.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {!initialEmail && (
          <div>
            <label className="block text-sm text-night mb-1.5 px-1">Email</label>
            <input
              className="input-pill"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm text-night mb-1.5 px-1">Código</label>
          <input
            className="input-pill text-center text-xl tracking-[0.3em] font-bold py-4"
            inputMode="numeric"
            pattern="\d{4,8}"
            maxLength={8}
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            autoComplete="one-time-code"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-night mb-1.5 px-1">Nueva contraseña</label>
          <PasswordInput
            placeholder="Escribe tu nueva contraseña"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        <div>
          <label className="block text-sm text-night mb-1.5 px-1">Repite contraseña</label>
          <PasswordInput
            placeholder="Repite la contraseña"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
          />
        </div>

        <button type="submit" disabled={loading} className="btn-yellow mt-2">
          {loading ? 'Restableciendo…' : 'Restablecer contraseña'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AppShell hideNav header="back" title="Nueva contraseña">
      <Suspense>
        <ResetForm />
      </Suspense>
    </AppShell>
  );
}
