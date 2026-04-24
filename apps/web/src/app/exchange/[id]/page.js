'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';
import Scanner from '@/components/scanner/Scanner';
import { exchangesApi } from '@/services/domainApi';

export default function ExchangePage() {
  return (
    <AuthGuard>
      <AppShell>
        <Inner />
      </AppShell>
    </AuthGuard>
  );
}

function Inner() {
  const { id } = useParams();
  const router = useRouter();
  const user = useSelector((s) => s.auth.user);
  const [ex, setEx] = useState(null);
  const [scanning, setScanning] = useState(false);

  const load = useCallback(async () => {
    try {
      const box = 'inbox';
      const items = await exchangesApi.list(box);
      let found = items.find((i) => i.id === id);
      if (!found) {
        const out = await exchangesApi.list('outbox');
        found = out.find((i) => i.id === id);
      }
      if (found) setEx(found);
    } catch (err) {
      toast.error('Error cargando');
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!ex) return <p>Cargando…</p>;

  const iAmRecipient = user?.id === ex.recipientId;
  const iAmSender = user?.id === ex.senderId;

  async function respond(action) {
    try {
      await exchangesApi.respond(id, action);
      toast.success(action === 'accept' ? 'Aceptado' : 'Rechazado');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error');
    }
  }

  async function onScanValidate({ value, method }) {
    try {
      await exchangesApi.validate(id, { tagUid: value, scanMethod: method });
      toast.success('¡Intercambio validado!');
      setScanning(false);
      router.replace('/wardrobe');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error validando');
    }
  }

  async function cancel() {
    try {
      await exchangesApi.cancel(id);
      toast.success('Cancelado');
      router.replace('/home');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error');
    }
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <h1 className="text-lg font-bold">Intercambio</h1>
        <p className="text-sm text-white/70">Estado: <span className="font-semibold">{ex.status}</span></p>
        <p className="text-sm text-white/70">Token: {ex.token?.product?.name}</p>
        <p className="text-xs text-white/60">De {ex.sender?.username} a {ex.recipient?.username}</p>
      </div>

      {iAmRecipient && ex.status === 'pending' && (
        <div className="flex gap-2">
          <button className="btn-primary flex-1" onClick={() => respond('accept')}>Aceptar</button>
          <button className="btn-secondary flex-1" onClick={() => respond('reject')}>Rechazar</button>
        </div>
      )}

      {iAmRecipient && ex.status === 'accepted' && !scanning && (
        <button className="btn-primary w-full" onClick={() => setScanning(true)}>
          Escanear pin para validar
        </button>
      )}

      {scanning && <Scanner mode="auto" onScan={onScanValidate} onClose={() => setScanning(false)} />}

      {iAmSender && ['pending', 'accepted'].includes(ex.status) && (
        <button className="btn-ghost w-full" onClick={cancel}>
          Cancelar intercambio
        </button>
      )}
    </div>
  );
}
