'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Modal from '@/components/feedback/Modal';
import { exchangesApi } from '@/services/domainApi';

/**
 * TokenRequestModal — XD `User wants to send me a token.png`.
 * Disparado por evento socket `notification:new` tipo `token_received`.
 * Botones rojo "Rechazar" / verde "Aceptar".
 *
 * Tras aceptar: dispara onAccepted (que el caller puede usar para abrir CoordinateDeliveryModal).
 * Tras rechazar: cierra y refresca lista.
 */
export default function TokenRequestModal({ open, onClose, exchangeId, fromUser, onAccepted }) {
  const router = useRouter();
  const [loading, setLoading] = useState(null); // 'accept' | 'reject' | null

  async function respond(action) {
    setLoading(action);
    try {
      await exchangesApi.respond(exchangeId, action);
      if (action === 'accept') {
        onAccepted?.();
      } else {
        toast('Token rechazado');
        onClose();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error');
    } finally {
      setLoading(null);
    }
  }

  return (
    <Modal open={open} onClose={onClose} ariaLabel="Solicitud de token" dismissOnOverlay={false}>
      <h2 className="text-xl font-bold text-night">
        {fromUser?.username ? `${fromUser.username} quiere` : 'Alguien quiere'}<br />enviarte un token!
      </h2>
      <p className="mt-2 text-sm text-text-muted">¿Aceptas o rechazas?</p>

      <div className="mt-5 flex flex-col items-center">
        <div className="relative">
          <div className="h-20 w-20 rounded-full overflow-hidden bg-surface flex items-center justify-center">
            {fromUser?.profilePicture ? (
              <Image src={fromUser.profilePicture} alt="" width={80} height={80} className="object-cover h-full w-full" />
            ) : (
              <span className="text-2xl font-bold text-text-muted">{(fromUser?.username || '??').slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <span className="absolute right-0 top-1 h-3 w-3 rounded-full bg-cyan ring-2 ring-white" />
        </div>
        <p className="mt-2 font-bold text-night">{fromUser?.username || 'Usuario'}</p>
        {/* NO level/rating */}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => respond('reject')}
          disabled={loading !== null}
          className="rounded-full bg-reject text-white font-bold py-3 transition active:scale-95 disabled:opacity-50"
        >
          {loading === 'reject' ? '…' : '✕ Rechazar'}
        </button>
        <button
          type="button"
          onClick={() => respond('accept')}
          disabled={loading !== null}
          className="rounded-full bg-accept text-white font-bold py-3 transition active:scale-95 disabled:opacity-50"
        >
          {loading === 'accept' ? '…' : '✓ Aceptar'}
        </button>
      </div>
    </Modal>
  );
}
