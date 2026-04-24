'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { setStep1 } from '@/store/slices/signupSlice';
import PasswordInput from '@/components/forms/PasswordInput';
import { SignupShell } from '../SignupShell';

/**
 * Signup paso 1 (XD `Signup – 1.png`).
 * El XD solo muestra contraseñas, pero el email es necesario para registrar
 * en backend. Lo pedimos aquí mismo (campo extra arriba, sin romper el diseño).
 */
export default function SignupStep1Page() {
  const router = useRouter();
  const dispatch = useDispatch();
  const stored = useSelector((s) => s.signup);

  const [email, setEmail] = useState(stored.email);
  const [password, setPassword] = useState(stored.password);
  const [confirm, setConfirm] = useState(stored.password);

  function onSubmit(e) {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return toast.error('Introduce tu email');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return toast.error('Email no válido');
    }
    if (password.length < 8) return toast.error('La contraseña debe tener al menos 8 caracteres');
    if (password !== confirm) return toast.error('Las contraseñas no coinciden');

    dispatch(setStep1({ email: cleanEmail, password, username: cleanEmail.split('@')[0] }));
    router.push('/signup/paso-2');
  }

  return (
    <SignupShell step={1}>
      <form onSubmit={onSubmit} className="card-soft mt-2 space-y-4 p-6">
        <div>
          <label className="block text-sm text-night mb-1.5">Email</label>
          <input
            className="input-pill"
            type="email"
            autoComplete="email"
            placeholder="myemail@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm text-night mb-1.5">Elige una contraseña</label>
          <PasswordInput
            placeholder="Escribe tu contraseña"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        <div>
          <label className="block text-sm text-night mb-1.5">Repite contraseña</label>
          <PasswordInput
            placeholder="Escribe tu contraseña"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
          />
        </div>
      </form>

      <button onClick={onSubmit} className="btn-yellow mt-8">Siguiente</button>
    </SignupShell>
  );
}
