'use client';

import Image from 'next/image';

/**
 * Logo Zero NPC.
 * - variant="dark"  → para fondos blancos (logo con texto oscuro)
 * - variant="light" → para fondos negros (logo con texto blanco)
 *
 * Usa los PNG portados desde el legacy (`Logo.png` y `logo_dark.png`).
 * En el XD, el header tabbed muestra el logo oscuro sobre fondo blanco;
 * el splash y el drawer muestran el logo claro sobre fondo negro.
 */
export default function Logo({ variant = 'dark', className = '', width = 96, height = 28, priority = false }) {
  const src = variant === 'light' ? '/images/Logo.png' : '/images/logo_dark.png';
  return (
    <Image
      src={src}
      alt="Zero NPC"
      width={width}
      height={height}
      priority={priority}
      className={className}
      sizes={`${width}px`}
    />
  );
}
