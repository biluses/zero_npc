'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import Logo from '@/components/brand/Logo';
import { clearSignup } from '@/store/slices/signupSlice';

/**
 * Indicador "paso 1 / paso 2 / paso 3" con barra de progreso animada.
 * La barra amarilla se expande horizontalmente según el paso activo.
 */
export function StepIndicator({ current = 1 }) {
  const total = 3;
  const pct = (current / total) * 100;
  return (
    <div className="mt-2 mb-6">
      <div className="flex items-end justify-center gap-6">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex flex-col items-center leading-none">
            <span
              className={
                n === current
                  ? 'text-sm text-night font-medium lowercase'
                  : 'text-xs text-text-muted/60 lowercase'
              }
            >
              paso
            </span>
            <motion.span
              initial={false}
              animate={{
                scale: n === current ? 1.2 : 1,
                opacity: n <= current ? 1 : 0.4,
              }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              className={
                n === current
                  ? 'text-5xl font-extrabold text-night mt-1'
                  : 'text-3xl font-bold text-text-muted/60 mt-1'
              }
            >
              {n}
            </motion.span>
          </div>
        ))}
      </div>

      {/* Barra de progreso */}
      <div className="mt-4 mx-auto h-1.5 max-w-xs rounded-full bg-border-soft overflow-hidden">
        <motion.div
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
          className="h-full bg-yellow"
        />
      </div>
    </div>
  );
}

/**
 * Shell del flujo signup con animaciones slide direccionales.
 *
 * Props:
 *  - step: número de paso actual (1, 2, 3).
 *  - direction: 'forward' | 'back' | 'initial' — dirige la animación al cambiar de paso.
 *  - onBack: callback del botón atrás (si null, muestra close → /login).
 *
 * Uso: cada page de paso envuelve su contenido con `<SignupShell step={N} direction={dir}>`.
 */
export function SignupShell({ step, direction = 'forward', onBack, children }) {
  const router = useRouter();
  const dispatch = useDispatch();

  function handleBack() {
    if (onBack) return onBack();
    // Paso 1 sin onBack: descartar signup y volver a login.
    dispatch(clearSignup());
    router.replace('/login');
  }

  const variants = {
    enter: (dir) => ({
      x: dir === 'back' ? -32 : 32,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({
      x: dir === 'back' ? 32 : -32,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col mx-auto max-w-md w-full px-6 pt-4 pb-8 overflow-hidden">
      {/* Header: back button + logo centrado */}
      <header className="relative flex items-center">
        <button
          type="button"
          onClick={handleBack}
          aria-label={step === 1 ? 'Cancelar registro' : 'Paso anterior'}
          className="-ml-1 p-2 text-night hover:opacity-70 transition active:scale-95"
        >
          {step === 1 ? <CloseIcon /> : <BackArrow />}
        </button>
        <div className="absolute left-1/2 -translate-x-1/2">
          <Logo variant="dark" width={100} height={28} priority />
        </div>
      </header>

      <StepIndicator current={step} />

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'tween', duration: 0.28, ease: 'easeOut' }}
          className="flex-1 flex flex-col"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function BackArrow() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6L8 16l12 10" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}
