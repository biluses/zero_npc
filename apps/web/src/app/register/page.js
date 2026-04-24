'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { authApi } from '@/services/authApi';
import PasswordInput from '@/components/forms/PasswordInput';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', username: '' });
  const [loading, setLoading] = useState(false);

  function update(k) {
    return (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.register(form);
      toast.success('Te hemos enviado un código por email');
      router.replace(`/verify-otp?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-app py-10">
      <h1 className="text-2xl font-bold">Crea tu cuenta</h1>
      <p className="mt-2 text-sm text-white/60">Te enviaremos un código para verificar tu email.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input className="input" placeholder="Nombre de usuario" value={form.username} onChange={update('username')} required />
        <input className="input" type="email" placeholder="Email" autoComplete="email" value={form.email} onChange={update('email')} required />
        <PasswordInput
          placeholder="Contraseña (8+ caracteres)"
          autoComplete="new-password"
          value={form.password}
          onChange={update('password')}
          required
          minLength={8}
        />
        <button className="btn-primary w-full" disabled={loading} type="submit">
          {loading ? 'Creando…' : 'Crear cuenta'}
        </button>
      </form>

      <p className="mt-6 text-sm text-white/70">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-brand-300">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
