'use client';

import { useRouter } from 'next/navigation';
import Modal from '@/components/feedback/Modal';

/**
 * CoordinateDeliveryModal — XD `Coordinate Delivery.png`.
 * Tras aceptar un token: "¡Genial! Has aceptado un token de [user]. Ahora podéis coordinar la entrega."
 * CTA amarilla "OK" → abre chat con el otro usuario.
 */
export default function CoordinateDeliveryModal({ open, onClose, otherUserId, otherUsername }) {
  const router = useRouter();

  function onOk() {
    onClose();
    if (otherUserId) router.push(`/chat/${otherUserId}`);
  }

  return (
    <Modal open={open} onClose={onClose} ariaLabel="Coordinar entrega" dismissOnOverlay={false}>
      <h2 className="text-2xl font-bold text-night">¡Genial!</h2>
      <p className="mt-3 text-sm text-text-muted">
        Has aceptado un token{otherUsername ? ` de ${otherUsername}` : ''}.
      </p>
      <p className="mt-1 text-sm text-text-muted">
        Ahora podéis coordinar la entrega.
      </p>
      <button type="button" onClick={onOk} className="btn-yellow mt-6">OK</button>
    </Modal>
  );
}
