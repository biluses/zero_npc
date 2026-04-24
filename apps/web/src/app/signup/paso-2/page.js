'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { setStep2 } from '@/store/slices/signupSlice';
import { SignupShell } from '../SignupShell';

/**
 * Signup paso 2 (XD `Signup – 2.png`).
 * Nombre + Dirección para recibir tokens.
 *
 * Provincias ES: lista corta hardcoded (el backend no necesita validar contra catálogo
 * para MVP — es texto libre con sugerencias).
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

  // Bounce al paso 1 si llegan directos sin email
  useEffect(() => {
    if (!stored.email || !stored.password) router.replace('/signup/paso-1');
  }, [stored.email, stored.password, router]);

  const [fullName, setFullName] = useState(stored.fullName);
  const [addressLine1, setAddressLine1] = useState(stored.addressLine1);
  const [addressLine2, setAddressLine2] = useState(stored.addressLine2);
  const [postalCode, setPostalCode] = useState(stored.postalCode);
  const [province, setProvince] = useState(stored.province);

  function onSubmit(e) {
    e.preventDefault();
    if (!fullName.trim()) return toast.error('Introduce tu nombre');
    if (!addressLine1.trim()) return toast.error('Introduce tu dirección');
    if (!/^\d{5}$/.test(postalCode.trim())) return toast.error('Código postal no válido (5 dígitos)');
    if (!province.trim()) return toast.error('Selecciona una provincia');

    dispatch(setStep2({ fullName, addressLine1, addressLine2, postalCode, province }));
    router.push('/signup/paso-3');
  }

  return (
    <SignupShell step={2}>
      <form onSubmit={onSubmit} className="card-soft mt-2 space-y-4 p-6">
        <div>
          <label className="block text-sm text-night mb-1.5">¿Cómo te llamamos?</label>
          <input
            className="input-pill"
            placeholder="Tu nombre"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            maxLength={80}
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm text-night px-1">Dirección para recibir tokens</label>
          <input
            className="input-pill"
            placeholder="Dirección 1"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            required
            maxLength={120}
          />
          <input
            className="input-pill"
            placeholder="Dirección 2"
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
            maxLength={120}
          />
          <input
            className="input-pill"
            inputMode="numeric"
            pattern="\d{5}"
            placeholder="Código postal"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
            required
          />
          <select
            className="input-pill appearance-none"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            required
          >
            <option value="" disabled>Provincia</option>
            {PROVINCIAS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </form>

      <button onClick={onSubmit} className="btn-yellow mt-8">Siguiente</button>
    </SignupShell>
  );
}
