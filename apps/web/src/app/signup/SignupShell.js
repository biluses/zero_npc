'use client';

import Logo from '@/components/brand/Logo';

/**
 * Indicador "paso 1 / paso 2 / paso 3" del flujo Signup XD.
 * El paso activo: text-3xl font-bold black.
 * Inactivos: text-base text-gray-300.
 */
export function StepIndicator({ current = 1 }) {
  const steps = [1, 2, 3];
  return (
    <div className="flex items-end justify-center gap-6 mt-2 mb-6">
      {steps.map((n) => (
        <div key={n} className="flex flex-col items-center leading-none">
          <span className={n === current ? 'text-sm text-night font-medium lowercase' : 'text-xs text-text-muted/60 lowercase'}>
            paso
          </span>
          <span
            className={
              n === current
                ? 'text-5xl font-extrabold text-night mt-1'
                : 'text-3xl font-bold text-text-muted/40 mt-1'
            }
          >
            {n}
          </span>
        </div>
      ))}
    </div>
  );
}

export function SignupShell({ step, children }) {
  return (
    <div className="min-h-[100dvh] bg-white flex flex-col mx-auto max-w-md w-full px-6 pt-8 pb-8">
      <div className="flex justify-center">
        <Logo variant="dark" width={100} height={28} priority />
      </div>
      <StepIndicator current={step} />
      {children}
    </div>
  );
}
