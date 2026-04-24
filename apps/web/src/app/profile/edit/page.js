'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';
import { usersApi } from '@/services/domainApi';
import { authApi } from '@/services/authApi';
import { setUser } from '@/store/slices/authSlice';

/**
 * /profile/edit — editar nombre, dirección y avatar del usuario autenticado.
 * Usa PATCH /users/me y POST /users/me/avatar.
 */
export default function ProfileEditPage() {
  return (
    <AuthGuard>
      <Content />
    </AuthGuard>
  );
}

function Content() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    fullName: '',
    username: '',
    addressLine1: '',
    addressLine2: '',
    postalCode: '',
    province: '',
    city: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || '',
        username: user.username || '',
        addressLine1: user.addressLine1 || '',
        addressLine2: user.addressLine2 || '',
        postalCode: user.postalCode || '',
        province: user.province || '',
        city: user.city || '',
      });
    }
  }, [user]);

  function update(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function onPickAvatar() {
    fileRef.current?.click();
  }

  function onAvatarChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      return toast.error('Solo se aceptan JPG, PNG o WebP');
    }
    if (f.size > 5 * 1024 * 1024) return toast.error('Máx 5 MB');
    setAvatarFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. PATCH datos (solo los campos no vacíos + username si ha cambiado).
      const patch = {};
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '' && v !== user?.[k]) patch[k] = v;
      });
      if (Object.keys(patch).length > 0) {
        const res = await usersApi.updateMe(patch);
        if (res) dispatch(setUser(res));
      }

      // 2. Avatar si hay archivo nuevo.
      if (avatarFile) {
        const res = await usersApi.uploadAvatar(avatarFile);
        if (res?.user) dispatch(setUser(res.user));
      }

      // 3. Refresco del usuario completo desde /auth/me.
      try {
        const me = await authApi.me();
        if (me?.user) dispatch(setUser(me.user));
      } catch (_e) { /* ignorar */ }

      toast.success('Perfil actualizado');
      router.push('/profile');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'No se pudo actualizar');
    } finally {
      setLoading(false);
    }
  }

  const initials = (form.fullName || user?.email || '??')
    .replace(/[@.]/g, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() || '')
    .join('');
  const currentAvatar = previewUrl || user?.profilePicture;

  return (
    <AppShell hideNav header="back" title="Editar perfil">
      <form onSubmit={onSubmit} className="px-4 pt-2 pb-32 space-y-4">
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onPickAvatar}
            aria-label="Cambiar foto"
            className="h-28 w-28 rounded-full bg-surface overflow-hidden flex items-center justify-center shadow-card"
          >
            {currentAvatar ? (
              <Image src={currentAvatar} alt="Avatar" width={112} height={112} className="object-cover h-full w-full" />
            ) : (
              <span className="text-3xl font-bold text-text-muted">{initials || '?'}</span>
            )}
          </button>
          <button type="button" onClick={onPickAvatar} className="link-magenta text-sm">
            Cambiar foto
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onAvatarChange}
            className="hidden"
          />
        </div>

        <Field label="Nombre">
          <input className="input-pill" value={form.fullName} onChange={update('fullName')} maxLength={120} />
        </Field>
        <Field label="Usuario">
          <input
            className="input-pill"
            value={form.username}
            onChange={update('username')}
            minLength={3}
            maxLength={64}
            pattern="[a-zA-Z0-9_.]+"
            title="Solo letras, números, guión bajo y punto"
          />
        </Field>
        <Field label="Dirección 1">
          <input className="input-pill" value={form.addressLine1} onChange={update('addressLine1')} maxLength={160} />
        </Field>
        <Field label="Dirección 2">
          <input className="input-pill" value={form.addressLine2} onChange={update('addressLine2')} maxLength={160} />
        </Field>
        <Field label="Ciudad">
          <input className="input-pill" value={form.city} onChange={update('city')} maxLength={120} />
        </Field>
        <Field label="Código postal">
          <input
            className="input-pill"
            inputMode="numeric"
            value={form.postalCode}
            onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
          />
        </Field>
        <Field label="Provincia">
          <input className="input-pill" value={form.province} onChange={update('province')} maxLength={80} />
        </Field>

        <button type="submit" disabled={loading} className="btn-yellow mt-4">
          {loading ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>
    </AppShell>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm text-night mb-1.5 px-1">{label}</label>
      {children}
    </div>
  );
}
