'use client';

import { useRouter } from 'next/navigation';
import Modal from '@/components/feedback/Modal';
import { SilverBadge, BoxToken } from '@/components/brand/icons';

/**
 * TokenSentModal — XD `Token Sent.png`.
 * Recompensa tras enviar un token: insignia plata + caja "+5".
 * CTAs: amarilla "¿Hacer una publicación?" (con badge +5) y link "Ahora no".
 */
export default function TokenSentModal({ open, onClose, prefillCaption = '' }) {
  const router = useRouter();

  function onPublish() {
    onClose();
    router.push(`/post/new?prefill=${encodeURIComponent(prefillCaption)}`);
  }

  return (
    <Modal open={open} onClose={onClose} ariaLabel="Token enviado">
      <h2 className="text-xl font-bold text-night">¡Estás imparable!</h2>
      <p className="mt-1 text-sm text-text-muted">Has ganado las siguientes recompensas</p>

      <div className="mt-6 flex items-center justify-center gap-6">
        <div className="flex flex-col items-center">
          <SilverBadge size={64} />
          <span className="mt-1 text-xs text-text-muted text-center leading-tight">Insignia<br />de plata</span>
        </div>
        <div className="relative">
          <BoxToken size={64} />
          <span className="absolute -top-1 -right-2 inline-flex items-center justify-center h-6 px-1.5 rounded-full bg-yellow text-xs font-bold text-night">+5</span>
        </div>
      </div>

      <button type="button" onClick={onPublish} className="btn-yellow mt-6 relative">
        ¿Hacer una publicación?
        <span className="absolute -top-2 -right-2 inline-flex items-center justify-center h-6 px-1.5 rounded-full bg-night text-xs font-bold text-yellow">+5</span>
      </button>
      <button type="button" onClick={onClose} className="link-magenta mt-3 text-sm">Ahora no</button>
    </Modal>
  );
}
