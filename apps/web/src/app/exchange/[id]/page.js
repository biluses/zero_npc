'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';
import Scanner from '@/components/scanner/Scanner';
import { exchangesApi } from '@/services/domainApi';
import CoordinateDeliveryModal from '@/components/modals/CoordinateDeliveryModal';

const STATUS_LABELS = {
  pending: { label: 'Pendiente', color: 'bg-yellow text-night' },
  accepted: { label: 'Aceptado', color: 'bg-accept text-white' },
  rejected: { label: 'Rechazado', color: 'bg-reject text-white' },
  validated: { label: 'Validado', color: 'bg-night text-yellow' },
  cancelled: { label: 'Cancelado', color: 'bg-text-muted text-white' },
  expired: { label: 'Expirado', color: 'bg-text-muted text-white' },
};

export default function ExchangePage() {
  return (
    <AuthGuard>
      <Inner />
    </AuthGuard>
  );
}

function Inner() {
  const { id } = useParams();
  const router = useRouter();
  const user = useSelector((s) => s.auth.user);
  const [ex, setEx] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [coordOpen, setCoordOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const inboxItems = await exchangesApi.list('inbox');
      let found = inboxItems.find((i) => i.id === id);
      if (!found) {
        const out = await exchangesApi.list('outbox');
        found = out.find((i) => i.id === id);
      }
      if (found) setEx(found);
    } catch (err) {
      toast.error('Error cargando');
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (!ex) {
    return (
      <AppShell hideNav header="back" title="Intercambio">
        <p className="text-text-muted text-sm py-8 text-center">Cargando…</p>
      </AppShell>
    );
  }

  const iAmRecipient = user?.id === ex.recipientId;
  const iAmSender = user?.id === ex.senderId;
  const status = STATUS_LABELS[ex.status] || { label: ex.status, color: 'bg-surface text-night' };

  async function respond(action) {
    try {
      await exchangesApi.respond(id, action);
      toast.success(action === 'accept' ? 'Aceptado' : 'Rechazado');
      if (action === 'accept') setCoordOpen(true);
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
      router.replace('/profile');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error');
    }
  }

  return (
    <AppShell hideNav header="back" title="Intercambio">
      <div className="px-4 pt-2 pb-32 space-y-4">
        <div className="card-soft">
          <div className="flex items-center justify-between mb-2">
            <p className="font-bold text-night">{ex.token?.product?.name || 'Token'}</p>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${status.color}`}>{status.label}</span>
          </div>
          <p className="text-sm text-text-muted">
            De <span className="font-medium text-night">{ex.sender?.username || '—'}</span>
            {' '}a <span className="font-medium text-night">{ex.recipient?.username || '—'}</span>
          </p>
          {ex.message && <p className="mt-2 text-sm text-night italic">"{ex.message}"</p>}
        </div>

        {iAmRecipient && ex.status === 'pending' && (
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => respond('reject')} className="rounded-full bg-reject text-white font-bold py-3">
              ✕ Rechazar
            </button>
            <button onClick={() => respond('accept')} className="rounded-full bg-accept text-white font-bold py-3">
              ✓ Aceptar
            </button>
          </div>
        )}

        {iAmRecipient && ex.status === 'accepted' && !scanning && (
          <button onClick={() => setScanning(true)} className="btn-yellow">
            Escanear pin para validar
          </button>
        )}

        {iAmSender && ['pending', 'accepted'].includes(ex.status) && (
          <button onClick={cancel} className="btn-secondary">
            Cancelar intercambio
          </button>
        )}
      </div>

      {scanning && (
        <div className="fixed inset-0 z-50 bg-night">
          <Scanner mode="auto" onScan={onScanValidate} onClose={() => setScanning(false)} />
        </div>
      )}

      <CoordinateDeliveryModal
        open={coordOpen}
        onClose={() => setCoordOpen(false)}
        otherUserId={ex.senderId}
        otherUsername={ex.sender?.username}
      />
    </AppShell>
  );
}
