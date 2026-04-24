'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';

/**
 * Help — XD `HELP-SECTION.PNG` (versión simplificada para MVP).
 * Cards: Contactar Soporte, Guías y Tutoriales, Recursos.
 * FAQs estáticas con tabs Todos/Account/Orders/Returns.
 * Contáctanos: email + teléfono + horario.
 */

const FAQS = [
  { tab: 'Account', q: '¿Cómo restablezco mi contraseña?', a: 'Ve a "¿Olvidaste tu contraseña?" en el login y sigue las instrucciones del email.' },
  { tab: 'Account', q: '¿Cómo puedo cambiar mi dirección de correo electrónico?', a: 'Por seguridad, escríbenos a soporte@zero-npc.com con tu nuevo email.' },
  { tab: 'Orders', q: '¿Qué métodos de pago aceptan?', a: 'Tarjeta de crédito, Google Pay y Apple Pay vía Stripe.' },
  { tab: 'Orders', q: '¿Cómo puedo rastrear mi pedido?', a: 'Desde "Mis pedidos" en tu perfil verás el estado y enlace de seguimiento.' },
  { tab: 'Returns', q: '¿Cuál es la política de devoluciones?', a: 'Tienes 14 días desde la recepción para solicitar la devolución.' },
  { tab: 'Account', q: '¿Cómo escanear códigos QR?', a: 'Pulsa el botón QR central del menú inferior y enfoca la etiqueta.' },
  { tab: 'Account', q: '¿Cuál es mi talla?', a: 'Cada producto incluye una guía de tallas en su ficha.' },
  { tab: 'Account', q: '¿Son sostenibles sus productos?', a: 'Trabajamos con proveedores comprometidos. Más info en nuestra web.' },
];

const TABS = ['Todos', 'Account', 'Orders', 'Returns'];

export default function HelpPage() {
  const router = useRouter();
  const [tab, setTab] = useState('Todos');
  const [open, setOpen] = useState(null);
  const [q, setQ] = useState('');

  const filtered = FAQS.filter((f) => {
    if (tab !== 'Todos' && f.tab !== tab) return false;
    if (q && !f.q.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <AppShell hideNav header="back" title="Ayuda" onBack={() => router.back()}>
      <div className="px-4 pt-2 pb-10">
        <h1 className="text-xl font-bold text-night">¿Cómo podemos ayudarte?</h1>
        <p className="text-sm text-text-muted">Encuentra respuestas, guías y recursos útiles</p>

        <input
          className="input-pill mt-4"
          type="search"
          placeholder="Buscar ayuda…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        {/* Cards principales */}
        <div className="mt-4 space-y-2">
          <a href="mailto:soporte@zero-npc.com" className="card-soft flex items-center gap-3 hover:bg-border-soft transition">
            <span className="h-9 w-9 rounded-lg bg-yellow flex items-center justify-center text-night text-lg">✉</span>
            <div>
              <p className="font-bold text-night text-sm">Contactar Soporte</p>
              <p className="text-xs text-text-muted">Obtén ayuda de nuestro equipo</p>
            </div>
          </a>
          <div className="card-soft flex items-center gap-3">
            <span className="h-9 w-9 rounded-lg bg-yellow flex items-center justify-center text-night text-lg">📖</span>
            <div>
              <p className="font-bold text-night text-sm">Guías y Tutoriales</p>
              <p className="text-xs text-text-muted">Aprende a usar la plataforma</p>
            </div>
          </div>
          <div className="card-soft flex items-center gap-3">
            <span className="h-9 w-9 rounded-lg bg-yellow flex items-center justify-center text-night text-lg">📂</span>
            <div>
              <p className="font-bold text-night text-sm">Recursos</p>
              <p className="text-xs text-text-muted">Documentos y descargas</p>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <h2 className="mt-6 mb-2 text-lg font-bold text-night">Preguntas Frecuentes</h2>
        <div className="flex gap-4 border-b border-border-soft text-sm">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`pb-2 -mb-px font-medium transition ${
                tab === t ? 'text-night border-b-2 border-yellow' : 'text-text-muted'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <ul className="mt-2 divide-y divide-border-soft">
          {filtered.map((f, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between py-3 text-left text-sm text-night hover:bg-surface px-1 rounded"
              >
                <span>{f.q}</span>
                <span className="text-text-muted">{open === i ? '−' : '+'}</span>
              </button>
              {open === i && <p className="pb-3 px-1 text-sm text-text-muted">{f.a}</p>}
            </li>
          ))}
          {filtered.length === 0 && <p className="text-text-muted text-sm py-3 text-center">Sin resultados</p>}
        </ul>

        {/* Contáctanos */}
        <h2 className="mt-8 mb-2 text-lg font-bold text-night">Contáctanos</h2>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2"><span>✉</span> <a href="mailto:soporte@zero-npc.com" className="link-magenta">soporte@zero-npc.com</a></li>
          <li className="flex items-center gap-2"><span>🕐</span> Lunes a Viernes, 9:00 - 18:00 (CET)</li>
        </ul>
      </div>
    </AppShell>
  );
}
