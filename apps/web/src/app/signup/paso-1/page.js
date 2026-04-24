'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { authApi } from '@/services/authApi';
import { setStep1, setDirection } from '@/store/slices/signupSlice';
import { parseBackendErrors } from '@/lib/formErrors';
import PasswordInput from '@/components/forms/PasswordInput';
import { SignupShell } from '../SignupShell';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEBOUNCE_MS = 400;

/**
 * Signup paso 1 — Email + contraseñas.
 *
 * - Check-email debounced contra `/auth/check-email` con estado visual (idle/checking/ok/taken).
 * - Validación final del paso contra `/auth/validate-step` antes de avanzar (incluye
 *   password strength y collision).
 * - Errores del backend se muestran inline por campo.
 * - Volver con back del header descarta el flujo y vuelve a /login.
 */
export default function SignupStep1Page() {
  const router = useRouter();
  const dispatch = useDispatch();
  const stored = useSelector((s) => s.signup);
  const direction = useSelector((s) => s.signup.direction);

  const [email, setEmail] = useState(stored.email);
  const [password, setPassword] = useState(stored.password);
  const [confirm, setConfirm] = useState(stored.password);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // check-email UX state
  const [emailCheck, setEmailCheck] = useState('idle'); // 'idle'|'checking'|'available'|'taken'|'invalid'

  // Resetear dirección a "forward" al entrar a paso 1 desde /login.
  useEffect(() => {
    if (direction !== 'initial' && direction !== 'back') dispatch(setDirection('initial'));
     
  }, []);

  // Debounced email check.
  useEffect(() => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setEmailCheck('idle');
      return undefined;
    }
    if (!EMAIL_RE.test(trimmed)) {
      setEmailCheck('invalid');
      return undefined;
    }

    setEmailCheck('checking');
    const t = setTimeout(async () => {
      try {
        const r = await authApi.checkEmail(trimmed);
        setEmailCheck(r.available ? 'available' : 'taken');
      } catch (_err) {
        // Rate-limit u otro error: no bloqueamos al user, deferimos a validate-step.
        setEmailCheck('idle');
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [email]);

  async function onSubmit(e) {
    e.preventDefault();
    setErrors({});
    if (submitting) return;

    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_RE.test(cleanEmail)) {
      return setErrors({ email: 'Email no válido' });
    }
    if (password !== confirm) {
      return setErrors({ passwordConfirm: 'Las contraseñas no coinciden' });
    }

    setSubmitting(true);
    try {
      // Validación server-side completa (incluye password strength y email collision).
      await authApi.validateStep({
        step: 1,
        email: cleanEmail,
        password,
        passwordConfirm: confirm,
      });

      dispatch(setStep1({
        email: cleanEmail,
        password,
        username: cleanEmail.split('@')[0],
      }));
      dispatch(setDirection('forward'));
      router.push('/signup/paso-2');
    } catch (err) {
      const parsed = parseBackendErrors(err);
      setErrors(parsed);
      if (parsed._form) toast.error(parsed._form);
    } finally {
      setSubmitting(false);
    }
  }

  const showEmailHint = emailCheck !== 'idle' && email.trim().length > 0;
  const emailHint = {
    checking: { cls: 'text-text-muted', text: 'Comprobando…' },
    available: { cls: 'text-accept', text: '✓ Disponible' },
    taken: { cls: 'text-reject', text: 'Email ya registrado' },
    invalid: { cls: 'text-reject', text: 'Email no válido' },
  }[emailCheck];

  return (
    <SignupShell step={1} direction={direction}>
      <form onSubmit={onSubmit} className="card-soft mt-2 space-y-4 p-6 flex-1">
        <div>
          <label className="block text-sm text-night mb-1.5">Email</label>
          <input
            className={`input-pill ${errors.email ? 'border-reject' : ''}`}
            type="email"
            autoComplete="email"
            placeholder="myemail@gmail.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
            aria-invalid={Boolean(errors.email)}
            aria-describedby="email-hint"
            required
          />
          {errors.email ? (
            <p id="email-hint" className="text-xs text-reject mt-1.5 px-1">{errors.email}</p>
          ) : showEmailHint && emailHint ? (
            <p id="email-hint" className={`text-xs ${emailHint.cls} mt-1.5 px-1`}>{emailHint.text}</p>
          ) : null}
        </div>

        <div>
          <label className="block text-sm text-night mb-1.5">Elige una contraseña</label>
          <PasswordInput
            placeholder="Escribe tu contraseña"
            autoComplete="new-password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
            aria-invalid={Boolean(errors.password)}
            required
            minLength={8}
          />
          {errors.password && (
            <p className="text-xs text-reject mt-1.5 px-1">{errors.password}</p>
          )}
          <p className="text-[11px] text-text-muted mt-1.5 px-1">
            Mínimo 8 caracteres con al menos una letra y un número.
          </p>
        </div>

        <div>
          <label className="block text-sm text-night mb-1.5">Repite contraseña</label>
          <PasswordInput
            placeholder="Escribe tu contraseña"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, passwordConfirm: undefined })); }}
            aria-invalid={Boolean(errors.passwordConfirm)}
            required
            minLength={8}
          />
          {errors.passwordConfirm && (
            <p className="text-xs text-reject mt-1.5 px-1">{errors.passwordConfirm}</p>
          )}
        </div>
      </form>

      <button
        onClick={onSubmit}
        disabled={submitting || emailCheck === 'taken' || emailCheck === 'invalid'}
        className="btn-yellow mt-6"
      >
        {submitting ? 'Validando…' : 'Siguiente'}
      </button>
    </SignupShell>
  );
}
