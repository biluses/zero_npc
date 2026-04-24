'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { authApi } from '@/services/authApi';
import { setCredentials } from '@/store/slices/authSlice';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      dispatch(setCredentials(data));
      toast.success('¡Bienvenid@!');
      router.replace('/home');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-app py-10">
      <h1 className="text-2xl font-bold">Inicia sesión</h1>
      <p className="mt-2 text-sm text-white/60">Accede con tu email y contraseña.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input
          className="input"
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input"
          type="password"
          placeholder="Contraseña"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="btn-primary w-full" disabled={loading} type="submit">
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between text-sm">
        <Link href="/forgot-password" className="text-white/70 hover:text-white">
          ¿Olvidaste tu contraseña?
        </Link>
        <Link href="/register" className="text-brand-300 hover:text-brand-200">
          Crear cuenta
        </Link>
      </div>
    </div>
  );
}
