'use client';

import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'react-toastify';
import Modal from '@/components/feedback/Modal';
import { friendsApi } from '@/services/domainApi';
import { BoxTokenUp, BoxTokenDown } from '@/components/brand/icons';

/**
 * AddFriendModal — XD `Add Friend.PNG` con tachados aplicados:
 * NO level "2 FT • Principiante", NO rating, NO logros, NO prendas.
 *
 * Mantiene: avatar + username + cards [Enviados][Recibidos] + CTA amarilla "Añadir este amigo" + link "Volver".
 *
 * Props:
 *  - user: { id, username, profilePicture, relationship, sentCount?, receivedCount? }
 *  - onClose()
 *  - onAdded() — tras request OK
 */
export default function AddFriendModal({ user, onClose, onAdded }) {
  const [loading, setLoading] = useState(false);

  async function onAdd() {
    setLoading(true);
    try {
      await friendsApi.request(user.id);
      onAdded?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'No se pudo enviar la solicitud');
    } finally {
      setLoading(false);
    }
  }

  const ctaLabel = (() => {
    if (user.relationship === 'accepted') return 'Ya es tu amigo';
    if (user.relationship === 'pending_outgoing') return 'Solicitud enviada';
    if (user.relationship === 'pending_incoming') return 'Acepta su solicitud';
    return 'Añadir este amigo';
  })();
  const ctaDisabled = loading || user.relationship !== 'none';

  return (
    <Modal open onClose={onClose} ariaLabel="Añadir amigo">
      <h2 className="text-xl font-bold text-night">Añadir amigo</h2>

      <div className="mt-4 flex flex-col items-center">
        <div className="relative h-24 w-24 rounded-full overflow-hidden bg-surface flex items-center justify-center">
          {user.profilePicture ? (
            <Image src={user.profilePicture} alt="" width={96} height={96} className="object-cover h-full w-full" />
          ) : (
            <span className="text-2xl font-bold text-text-muted">{(user.username || '??').slice(0, 2).toUpperCase()}</span>
          )}
          <span className="absolute right-0 top-1 h-3 w-3 rounded-full bg-cyan ring-2 ring-white" />
        </div>

        <p className="mt-3 text-lg font-bold text-night">{user.username || 'Usuario'}</p>
        {/* NO level/rating - tachados en XD */}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="card-soft py-4 flex flex-col items-center">
          <BoxTokenUp size={28} />
          <p className="mt-1 font-bold text-night">{user.sentCount ?? 0}</p>
          <p className="text-xs text-text-muted">Enviados</p>
        </div>
        <div className="card-soft py-4 flex flex-col items-center">
          <BoxTokenDown size={28} />
          <p className="mt-1 font-bold text-night">{user.receivedCount ?? 0}</p>
          <p className="text-xs text-text-muted">Recibidos</p>
        </div>
      </div>

      {/* NO cards Logros/Prendas - tachados en XD */}

      <button
        type="button"
        onClick={onAdd}
        disabled={ctaDisabled}
        className="btn-yellow mt-6"
      >
        {loading ? 'Enviando…' : ctaLabel}
      </button>
      <button type="button" onClick={onClose} className="link-magenta mt-3 text-sm">Volver</button>
    </Modal>
  );
}
