'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { authApi } from '@/services/authApi';
import { setCredentials } from '@/store/slices/authSlice';
import { applyPendingSignup } from '@/lib/applyPendingSignup';
import PasswordInput from '@/components/forms/PasswordInput';
import Logo from '@/components/brand/Logo';

/**
 * Login (XD `Login.png`).
 *
 * Layout fiel:
 *   - Fondo blanco.
 *   - Logo arriba + "bienvenido" bold.
 *   - Botón "Continuar con Google" (stub: toast "Próximamente"). NO Apple (tachado).
 *   - Separador "o".
 *   - Campos email + password (con eye toggle).
 *   - Checkbox "Recuérdame" (persiste email en localStorage).
 *   - CTA AMARILLA "Iniciar sesión".
 *   - Links magenta "¿Olvidaste tu contraseña?" y "Crear una ahora".
 */
export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const signupPending = useSelector((s) => s.signup);

  const initialEmail = typeof window !== 'undefined'
    ? window.localStorage.getItem('zero-npc-remember-email') || ''
    : '';

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(Boolean(initialEmail));
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.login({ email: email.trim().toLowerCase(), password });
      dispatch(setCredentials(data));
      if (remember) window.localStorage.setItem('zero-npc-remember-email', email);
      else window.localStorage.removeItem('zero-npc-remember-email');

      // Si venimos del flujo signup, aplicamos los datos pendientes
      // (perfil + avatar) ahora que ya hay accessToken.
      // Esperamos un tick para que el interceptor axios coja el token del store.
      await new Promise((r) => setTimeout(r, 50));
      await applyPendingSignup({ signup: signupPending, dispatch });

      toast.success('¡Bienvenid@!');
      router.replace('/profile');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  function onGoogle() {
    toast('Próximamente disponible', { icon: 'ℹ️' });
  }

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col mx-auto max-w-md w-full px-6 pt-10 pb-8">
      <div className="flex flex-col items-center">
        <Logo variant="dark" width={110} height={32} priority />
        <h1 className="mt-6 text-3xl font-bold text-night lowercase">bienvenido</h1>
      </div>

      <div className="mt-8 space-y-3">
        <button type="button" onClick={onGoogle} className="btn-outline">
          <Image src="/images/google_icon.svg" alt="" width={20} height={20} aria-hidden />
          <span>Continuar con Google</span>
        </button>
      </div>

      <div className="my-6 flex items-center justify-center text-sm text-text-muted">o</div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm text-night mb-1.5 px-1">Correo electrónico</label>
          <input
            id="email"
            className="input-pill"
            type="email"
            placeholder="myemail@gmail.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm text-night mb-1.5 px-1">Contraseña</label>
          <PasswordInput
            id="password"
            placeholder="Escribe tu contraseña"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-night px-1 select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-border-soft text-night focus:ring-night"
          />
          <span>Recuérdame</span>
        </label>

        <button type="submit" disabled={loading} className="btn-yellow mt-2">
          {loading ? 'Entrando…' : 'Iniciar sesión'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/forgot-password" className="link-magenta text-sm">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <div className="mt-auto pt-10 text-center text-sm text-night">
        ¿No tienes una cuenta?{' '}
        <Link href="/signup/paso-1" className="link-magenta">
          Crear una ahora
        </Link>
      </div>
    </div>
  );
}
