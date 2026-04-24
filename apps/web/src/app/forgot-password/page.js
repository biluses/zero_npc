'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '@/services/authApi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await authApi.forgot(email);
      setSent(true);
      toast.success('Si el email existe, hemos enviado un código');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al solicitar');
    }
  }

  return (
    <div className="container-app py-10">
      <h1 className="text-2xl font-bold">Recuperar contraseña</h1>
      {sent ? (
        <p className="mt-4 text-sm text-white/70">Revisa tu email y sigue las instrucciones.</p>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button className="btn-primary w-full">Enviar código</button>
        </form>
      )}
    </div>
  );
}
