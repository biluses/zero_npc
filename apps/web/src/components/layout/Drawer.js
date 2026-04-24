'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { clearCredentials } from '@/store/slices/authSlice';
import Logo from '@/components/brand/Logo';

/**
 * Drawer lateral fiel al XD `menu General.png`.
 * Fondo negro full overlay (slide desde derecha + fade).
 * Items: chat (badge magenta unread), ayuda y soporte, reportar un problema, privacidad
 * Footer: link magenta "cerrar sesión".
 *
 * Props:
 *  - open: boolean
 *  - onClose(): cerrar
 *  - unreadChatCount: number — badge en "chat"
 */
export default function Drawer({ open, onClose, unreadChatCount = 0 }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const accessToken = useSelector((s) => s.auth.accessToken);

  // Bloquear scroll body cuando el drawer está abierto
  useEffect(() => {
    if (open) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => document.body.classList.remove('no-scroll');
  }, [open]);

  // ESC cierra
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && open) onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  function handleLogout() {
    dispatch(clearCredentials());
    onClose();
    router.replace('/login');
  }

  function handleNav(href) {
    onClose();
    router.push(href);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          key="drawer"
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'tween', duration: 0.28, ease: 'easeOut' }}
          className="fixed inset-0 z-50 bg-night text-white flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Menú principal"
        >
          {/* Header dentro del drawer: igual al app header tabbed pero invertido */}
          <div className="flex items-center justify-between px-4 py-3">
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar menú"
              className="-ml-1 p-2 text-white hover:opacity-70 transition"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>
            <Logo variant="light" width={88} height={26} />
            <Link
              href="/notifications"
              onClick={onClose}
              aria-label="Notificaciones"
              className="-mr-1 p-2 text-white hover:opacity-70 transition"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 2a1 1 0 011 1v.6a7 7 0 016 6.9v3.5l1.5 2.5a1 1 0 01-.86 1.5H4.36a1 1 0 01-.86-1.5L5 14V10.5a7 7 0 016-6.9V3a1 1 0 011-1zM10 20h4a2 2 0 11-4 0z" />
              </svg>
            </Link>
          </div>

          {/* Items menu */}
          <nav className="flex-1 flex flex-col items-center justify-start gap-6 pt-12 px-6">
            <DrawerItem onClick={() => handleNav('/chat')} label="chat" badge={unreadChatCount} />
            <DrawerItem onClick={() => handleNav('/help')} label="ayuda y soporte" />
            <DrawerItem
              onClick={() => {
                onClose();
                window.location.href = 'mailto:soporte@zero-npc.com?subject=Reporte%20de%20problema';
              }}
              label="reportar un problema"
            />
            <DrawerItem onClick={() => handleNav('/legal?tab=privacy')} label="privacidad" />
          </nav>

          {/* Footer fijo */}
          <div className="px-6 pb-10 pt-6 flex justify-center safe-bottom">
            {accessToken ? (
              <button type="button" onClick={handleLogout} className="link-magenta text-lg lowercase">
                cerrar sesión
              </button>
            ) : (
              <Link href="/login" onClick={onClose} className="link-magenta text-lg lowercase">
                iniciar sesión
              </Link>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function DrawerItem({ onClick, label, badge = 0 }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 text-2xl font-medium text-white hover:opacity-80 transition lowercase"
    >
      <span>{label}</span>
      {badge > 0 && (
        <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full bg-magenta text-xs font-bold text-white">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}
