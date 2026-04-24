'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { authApi } from '@/services/authApi';
import { usersApi } from '@/services/domainApi';
import { clearSignup, setAvatarPreview } from '@/store/slices/signupSlice';
import { SignupShell } from '../SignupShell';

/**
 * Signup paso 3 (XD `Signup – 3.png`).
 * Avatar circular gris con iniciales auto + link "Añadir una foto" → file picker.
 * CTA "Hecho" → ejecuta:
 *   1. authApi.register({ email, password, username })
 *   2. usersApi.updateMe({ fullName, address... })
 *   3. usersApi.uploadAvatar(file)  (si hay foto)
 *   4. router.replace('/verify-otp?email=...')
 */
export default function SignupStep3Page() {
  const router = useRouter();
  const dispatch = useDispatch();
  const stored = useSelector((s) => s.signup);
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!stored.email || !stored.password || !stored.fullName) {
      router.replace('/signup/paso-1');
    }
  }, [stored, router]);

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
      return toast.error('Solo se aceptan imágenes JPG, PNG o WebP');
    }
    if (f.size > 5 * 1024 * 1024) {
      return toast.error('La imagen no puede superar 5 MB');
    }
    setFile(f);
    const url = URL.createObjectURL(f);
    dispatch(setAvatarPreview(url));
  }

  async function onSubmit() {
    setLoading(true);
    try {
      // 1. Registro principal.
      await authApi.register({
        email: stored.email,
        password: stored.password,
        username: stored.username,
      });

      // 2. Guardamos el avatar temporalmente en sessionStorage como base64,
      //    porque aún no hay login (el user debe verificar el OTP primero).
      //    Tras el primer login, `useApplyPendingSignup` aplica los datos.
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            sessionStorage.setItem('zero-npc-pending-avatar', reader.result);
            sessionStorage.setItem('zero-npc-pending-avatar-type', file.type);
          } catch (_e) {
            // sessionStorage puede fallar si excede cuota; no bloqueamos el flujo.
          }
        };
        reader.readAsDataURL(file);
      }

      toast.success('Cuenta creada. Te hemos enviado un código por email.');
      router.replace(`/verify-otp?email=${encodeURIComponent(stored.email)}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SignupShell step={3}>
      <div className="card-soft p-8 flex flex-col items-center justify-center gap-3">
        <button
          type="button"
          onClick={onPickFile}
          aria-label="Añadir una foto"
          className="h-44 w-44 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-card"
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
          Añadir una foto
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onFileChange}
          className="hidden"
        />
      </div>

      <button
        onClick={onSubmit}
        disabled={loading}
        className="btn-yellow mt-8"
      >
        {loading ? 'Creando cuenta…' : 'Hecho'}
      </button>
    </SignupShell>
  );
}
