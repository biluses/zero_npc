'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Modal base reutilizable (XD: overlay gris + card blanco rounded centrado).
 * Animación scale+fade con framer-motion.
 *
 * Uso:
 *   <Modal open={open} onClose={() => setOpen(false)} ariaLabel="Token enviado">
 *     <h2 className="text-xl font-bold">¡Genial!</h2>
 *     ...
 *   </Modal>
 *
 * Props:
 *  - open: boolean
 *  - onClose(): cerrar (clic en overlay o ESC)
 *  - ariaLabel: string accesibilidad (obligatorio)
 *  - dismissOnOverlay: boolean (default true) — si false, solo cierra con botón propio
 *  - children: contenido del card
 */
export default function Modal({ open, onClose, ariaLabel, dismissOnOverlay = true, children }) {
  useEffect(() => {
    if (open) document.body.classList.add('no-scroll');
    else document.body.classList.remove('no-scroll');
    return () => document.body.classList.remove('no-scroll');
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="modal-overlay"
          onClick={() => dismissOnOverlay && onClose()}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
        >
          <motion.div
            key="modal-card"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="modal-card text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
