'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { authApi } from '@/services/authApi';
import { setAvatarPreview, setDirection } from '@/store/slices/signupSlice';
import { firstErrorMessage } from '@/lib/formErrors';
import { SignupShell } from '../SignupShell';

const MAX_AVATAR_MB = 5;
const STORAGE_AVATAR = 'zero-npc-pending-avatar';
const STORAGE_AVATAR_TYPE = 'zero-npc-pending-avatar-type';

/**
 * Signup paso 3 — Avatar (opcional) + submit final.
 *
 * - Back → paso 2 (preserva estado).
 * - Submit:
 *    1. (Opcional) valida metadata del avatar en backend con validate-step.
 *    2. POST /auth/register con email + password + username + profile completo.
 *       El backend cifra PII en reposo automáticamente.
 *    3. Si hay avatar, lo persistimos en sessionStorage (base64) para que
 *       applyPendingSignup lo suba tras el primer login.
 *    4. Redirect a /verify-otp.
 */
export default function SignupStep3Page() {
  const router = useRouter();
  const dispatch = useDispatch();
  const stored = useSelector((s) => s.signup);
  const direction = useSelector((s) => s.signup.direction);
  const fileRef = useRef(null);

  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!stored.email || !stored.password || !stored.fullName) {
      router.replace('/signup/paso-1');
    }
     
  }, []);

  const initials = (stored.fullName || stored.email || '??')
    .replace(/[@.]/g, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() || '')
    .join('');

  function onPickFile() {
    fileRef.current?.click();
  }

  function onFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      return toast.error('Solo se aceptan JPG, PNG o WebP');
    }
    if (f.size > MAX_AVATAR_MB * 1024 * 1024) {
      return toast.error(`Máximo ${MAX_AVATAR_MB} MB`);
    }
    setFile(f);
    dispatch(setAvatarPreview(URL.createObjectURL(f)));
  }

  function onBack() {
    dispatch(setDirection('back'));
    router.push('/signup/paso-2');
  }

  async function persistAvatarToSession(f) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          sessionStorage.setItem(STORAGE_AVATAR, reader.result);
          sessionStorage.setItem(STORAGE_AVATAR_TYPE, f.type);
        } catch (_e) {
          // Cuota de sessionStorage excedida o bloqueada: no bloqueamos el flujo.
        }
        resolve();
      };
      reader.onerror = () => resolve();
      reader.readAsDataURL(f);
    });
  }

  async function onSubmit() {
    if (submitting) return;
    setSubmitting(true);
    try {
      // (Opcional) validación del avatar en backend.
      if (file) {
        await authApi.validateStep({
          step: 3,
          avatarMimetype: file.type,
          avatarSizeBytes: file.size,
        }).catch(() => { /* soft-fail: el upload real se valida en /users/me/avatar */ });
      }

      // Registro con datos completos — backend cifra PII.
      await authApi.register({
        email: stored.email,
        password: stored.password,
        username: stored.username,
        profile: {
          fullName: stored.fullName,
          addressLine1: stored.addressLine1,
          addressLine2: stored.addressLine2 || null,
          postalCode: stored.postalCode,
          province: stored.province,
        },
      });

      if (file) await persistAvatarToSession(file);

      toast.success('Cuenta creada. Te hemos enviado un código por email.');
      router.replace(`/verify-otp?email=${encodeURIComponent(stored.email)}`);
    } catch (err) {
      toast.error(firstErrorMessage(err, 'Error al crear la cuenta'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SignupShell step={3} direction={direction} onBack={onBack}>
      <div className="card-soft p-8 flex flex-col items-center justify-center gap-3 flex-1">
        <button
          type="button"
          onClick={onPickFile}
          aria-label="Añadir una foto"
          className="h-44 w-44 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-card transition active:scale-95"
        >
          {stored.avatarPreviewUrl ? (
            <Image
              src={stored.avatarPreviewUrl}
              alt="Avatar"
              width={176}
              height={176}
              className="object-cover h-full w-full"
            />
          ) : (
            <span className="text-6xl font-extrabold text-night">{initials || '?'}</span>
          )}
        </button>

        <button type="button" onClick={onPickFile} className="link-magenta mt-2">
          {stored.avatarPreviewUrl ? 'Cambiar foto' : 'Añadir una foto'}
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onFileChange}
          className="hidden"
        />

        <p className="text-[11px] text-text-muted text-center mt-2">
          Podrás cambiarla después desde tu perfil.
        </p>
      </div>

      <button
        onClick={onSubmit}
        disabled={submitting}
        className="btn-yellow mt-6"
      >
        {submitting ? 'Creando cuenta…' : 'Hecho'}
      </button>
    </SignupShell>
  );
}
