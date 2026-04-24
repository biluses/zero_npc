'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { authApi } from '@/services/authApi';
import { setStep2, setDirection } from '@/store/slices/signupSlice';
import { parseBackendErrors } from '@/lib/formErrors';
import { SignupShell } from '../SignupShell';

/**
 * Provincias de España ordenadas alfabéticamente (catálogo estático).
 */
const PROVINCIAS = [
  'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila', 'Badajoz',
  'Barcelona', 'Burgos', 'Cáceres', 'Cádiz', 'Cantabria', 'Castellón', 'Ciudad Real',
  'Córdoba', 'Cuenca', 'Girona', 'Granada', 'Guadalajara', 'Gipuzkoa', 'Huelva',
  'Huesca', 'Islas Baleares', 'Jaén', 'La Coruña', 'La Rioja', 'Las Palmas', 'León',
  'Lleida', 'Lugo', 'Madrid', 'Málaga', 'Murcia', 'Navarra', 'Ourense', 'Palencia',
  'Pontevedra', 'Salamanca', 'Santa Cruz de Tenerife', 'Segovia', 'Sevilla', 'Soria',
  'Tarragona', 'Teruel', 'Toledo', 'Valencia', 'Valladolid', 'Bizkaia', 'Zamora',
  'Zaragoza', 'Ceuta', 'Melilla',
];

export default function SignupStep2Page() {
  const router = useRouter();
  const dispatch = useDispatch();
  const stored = useSelector((s) => s.signup);
  const direction = useSelector((s) => s.signup.direction);

  // Si llegan sin email/password → bounce a paso 1 (si se hubiera perdido
  // la persistencia). Solo al primer render.
  useEffect(() => {
    if (!stored.email || !stored.password) router.replace('/signup/paso-1');
     
  }, []);

  const [form, setForm] = useState({
    fullName: stored.fullName || '',
    addressLine1: stored.addressLine1 || '',
    addressLine2: stored.addressLine2 || '',
    postalCode: stored.postalCode || '',
    province: stored.province || '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function update(key, raw) {
    let value = raw;
    if (key === 'postalCode') value = value.replace(/\D/g, '').slice(0, 5);
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  }

  function onBack() {
    // Persistimos lo introducido para que al volver no se pierda.
    dispatch(setStep2({ ...form }));
    dispatch(setDirection('back'));
    router.push('/signup/paso-1');
  }

  async function onSubmit(e) {
    e?.preventDefault();
    setErrors({});
    if (submitting) return;
    setSubmitting(true);
    try {
      await authApi.validateStep({ step: 2, ...form, addressLine2: form.addressLine2 || null, city: null });
      dispatch(setStep2(form));
      dispatch(setDirection('forward'));
      router.push('/signup/paso-3');
    } catch (err) {
      const parsed = parseBackendErrors(err);
      setErrors(parsed);
      if (parsed._form) toast.error(parsed._form);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SignupShell step={2} direction={direction} onBack={onBack}>
      <form onSubmit={onSubmit} className="card-soft mt-2 space-y-4 p-6 flex-1">
        <Field label="¿Cómo te llamamos?" error={errors.fullName}>
          <input
            className={`input-pill ${errors.fullName ? 'border-reject' : ''}`}
            placeholder="Tu nombre"
            value={form.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            maxLength={120}
            required
          />
        </Field>

        <div>
          <label className="block text-sm text-night mb-1.5 px-1">Dirección para recibir tokens</label>
          <div className="space-y-2">
            <input
              className={`input-pill ${errors.addressLine1 ? 'border-reject' : ''}`}
              placeholder="Dirección 1"
              value={form.addressLine1}
              onChange={(e) => update('addressLine1', e.target.value)}
              maxLength={160}
              required
            />
            {errors.addressLine1 && <p className="text-xs text-reject mt-1 px-1">{errors.addressLine1}</p>}

            <input
              className="input-pill"
              placeholder="Dirección 2 (opcional)"
              value={form.addressLine2}
              onChange={(e) => update('addressLine2', e.target.value)}
              maxLength={160}
            />

            <input
              className={`input-pill ${errors.postalCode ? 'border-reject' : ''}`}
              inputMode="numeric"
              pattern="\d{5}"
              placeholder="Código postal"
              value={form.postalCode}
              onChange={(e) => update('postalCode', e.target.value)}
              required
            />
            {errors.postalCode && <p className="text-xs text-reject mt-1 px-1">{errors.postalCode}</p>}

            <select
              className={`input-pill appearance-none ${errors.province ? 'border-reject' : ''}`}
              value={form.province}
              onChange={(e) => update('province', e.target.value)}
              required
            >
              <option value="" disabled>Provincia</option>
              {PROVINCIAS.map((p) => (<option key={p} value={p}>{p}</option>))}
            </select>
            {errors.province && <p className="text-xs text-reject mt-1 px-1">{errors.province}</p>}
          </div>
        </div>
      </form>

      <button onClick={onSubmit} disabled={submitting} className="btn-yellow mt-6">
        {submitting ? 'Validando…' : 'Siguiente'}
      </button>
    </SignupShell>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm text-night mb-1.5 px-1">{label}</label>
      {children}
      {error && <p className="text-xs text-reject mt-1 px-1">{error}</p>}
    </div>
  );
}
