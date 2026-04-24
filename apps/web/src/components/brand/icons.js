'use client';

/**
 * Iconos SVG custom del design system XD (no existen en el legacy npc_fe-main).
 * Inline SVG → cero peticiones extra, color via currentColor cuando aplica.
 *
 * Uso:
 *   <BoxTokenUp className="w-7 h-7" />
 *   <SilverBadge size={56} />
 */

const baseProps = (size, className) => ({
  width: size,
  height: size,
  viewBox: '0 0 32 32',
  fill: 'none',
  className,
  'aria-hidden': true,
});

// Caja de token con flecha hacia arriba (token enviado).
// Cuerpo negro, dot magenta arriba.
export function BoxTokenUp({ size = 32, className = '' }) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M16 4l11 5.5v13L16 28 5 22.5v-13L16 4z" fill="#101010" />
      <path d="M16 4l11 5.5L16 15 5 9.5 16 4z" fill="#1a1a1a" />
      <path d="M16 15v13L5 22.5v-13L16 15z" fill="#0a0a0a" />
      <circle cx="16" cy="11" r="2.2" fill="#FF00F2" />
      <path d="M22.5 7.5l3 -3m0 0v2.4m0 -2.4h-2.4" stroke="#101010" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Caja de token con flecha hacia abajo (token recibido).
// Cuerpo negro, dot amarillo arriba.
export function BoxTokenDown({ size = 32, className = '' }) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M16 4l11 5.5v13L16 28 5 22.5v-13L16 4z" fill="#101010" />
      <path d="M16 4l11 5.5L16 15 5 9.5 16 4z" fill="#1a1a1a" />
      <path d="M16 15v13L5 22.5v-13L16 15z" fill="#0a0a0a" />
      <circle cx="16" cy="11" r="2.2" fill="#EEFF00" />
      <path d="M25.5 4.5l-3 3m0 0V5.1m0 2.4h2.4" stroke="#101010" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Caja de token simple (mis tokens, en lista).
export function BoxToken({ size = 32, className = '' }) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M16 4l11 5.5v13L16 28 5 22.5v-13L16 4z" fill="#101010" />
      <path d="M16 4l11 5.5L16 15 5 9.5 16 4z" fill="#1a1a1a" />
      <path d="M16 15v13L5 22.5v-13L16 15z" fill="#0a0a0a" />
      <circle cx="16" cy="11" r="2.2" fill="#FF00F2" />
    </svg>
  );
}

// Apretón de manos (Store: "Colaborar con nosotros").
export function Handshake({ size = 48, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 48" fill="none" className={className} aria-hidden>
      <path
        d="M8 22l10-10 6 5 8-7 10 8 8-3 6 6-12 12-6-4-8 8-12-12-10 5z"
        fill="#101010"
      />
      <path d="M30 16l8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Insignia plata hexagonal (Token Sent recompensa).
export function SilverBadge({ size = 64, className = '' }) {
  const r = size / 2;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="silverG" x1="0" y1="0" x2="64" y2="64">
          <stop offset="0%" stopColor="#E5E5E5" />
          <stop offset="100%" stopColor="#A8A8A8" />
        </linearGradient>
      </defs>
      <polygon
        points="32,4 56,18 56,46 32,60 8,46 8,18"
        fill="url(#silverG)"
        stroke="#888"
        strokeWidth="1.5"
      />
      <polygon
        points="32,14 48,22 48,42 32,50 16,42 16,22"
        fill="none"
        stroke="#fff"
        strokeWidth="1.5"
      />
      <circle cx="32" cy="32" r="6" fill="#101010" />
    </svg>
  );
}

// Icono "añadir amigo" (header de Comunidad).
export function FriendsAdd({ size = 28, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <circle cx="11" cy="11" r="5" fill="#101010" />
      <path d="M2 26c0-5 4-9 9-9s9 4 9 9" stroke="#101010" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="24" cy="10" r="3" fill="#101010" />
      <path d="M24 13v8m-4 -4h8" stroke="#101010" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// Icono fuego/llama (perfil de usuario en home, ej. "iamsarah").
// El XD muestra una llama magenta junto al nombre.
export function FireFlame({ size = 22, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 2c1 3.5 4 5 4 9a4 4 0 11-8 0c0-2 1-3 1-5 0 0 2 1 3-4z"
        fill="#FF00F2"
      />
      <path d="M12 13a2 2 0 100 4 2 2 0 000-4z" fill="#EEFF00" />
    </svg>
  );
}

// Icono 3 puntos (tab Comunidad del bottom nav).
export function CommunityIcon({ size = 28, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden>
      <circle cx="9" cy="16" r="3.2" />
      <circle cx="22" cy="11" r="3.2" />
      <circle cx="22" cy="21" r="3.2" />
    </svg>
  );
}

// Icono perfil round (tab Yo).
export function ProfileIcon({ size = 28, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="16" cy="13" r="4.5" fill="currentColor" />
      <path d="M7 26c1.5-4 5-6 9-6s7.5 2 9 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// Icono caja simple (tab Tokens del bottom nav).
export function TokenBoxIcon({ size = 28, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden>
      <path d="M16 4l11 5.5v13L16 28 5 22.5v-13L16 4z" />
      <path d="M16 15v13" stroke="#fff" strokeWidth="0.6" />
      <circle cx="16" cy="11" r="2" fill="#FF00F2" />
    </svg>
  );
}

// Icono store/tienda (tab Store).
export function StoreIcon({ size = 28, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden>
      <path d="M5 11l2-5h18l2 5v3a3 3 0 01-6 0 3 3 0 01-6 0 3 3 0 01-6 0 3 3 0 01-4-2.4V11z" fillOpacity="0.85" />
      <path d="M6 14v13h20V14" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

// QR icon (FAB centro del bottom nav y header de Scan).
export function QrIcon({ size = 32, className = '', color = '#EEFF00' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill={color} className={className} aria-hidden>
      <rect x="4" y="4" width="9" height="9" rx="1" fill="none" stroke={color} strokeWidth="2" />
      <rect x="19" y="4" width="9" height="9" rx="1" fill="none" stroke={color} strokeWidth="2" />
      <rect x="4" y="19" width="9" height="9" rx="1" fill="none" stroke={color} strokeWidth="2" />
      <rect x="7" y="7" width="3" height="3" />
      <rect x="22" y="7" width="3" height="3" />
      <rect x="7" y="22" width="3" height="3" />
      <rect x="19" y="19" width="3" height="3" />
      <rect x="25" y="19" width="3" height="3" />
      <rect x="19" y="25" width="3" height="3" />
      <rect x="25" y="25" width="3" height="3" />
    </svg>
  );
}
