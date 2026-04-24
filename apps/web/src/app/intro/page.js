'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

/**
 * Intro 1/2/3 (XD).
 * Carousel de 3 slides:
 *   - Imagen full-width arriba (introImage1/2/3.png).
 *   - Sección negra inferior con título + párrafo + 3 dots + FAB circular con anillo de progreso magenta.
 *   - Botón cerrar X arriba derecha → /login.
 *
 * Fiel al XD `Intro 1.png`. Slide colors: 1 magenta, 2 amarillo, 3 cyan.
 */

const SLIDES = [
  {
    img: '/images/introImage1.png',
    title: 'Construye tu armario digital',
    text: 'Colecciona tokens NFC y QR vinculados a tus prendas físicas. Tu armario, ahora también en la app.',
    accent: '#FF00F2',
  },
  {
    img: '/images/introImage2.png',
    title: 'Intercambia con tu comunidad',
    text: 'Envía y recibe tokens entre amigos. Cada movimiento queda registrado y refleja tu identidad.',
    accent: '#EEFF00',
  },
  {
    img: '/images/introImage3.png',
    title: 'Comparte conexión',
    text: 'Comparte momentos, publica intercambios y descubre nuevos contactos. Bienvenido a Zero NPC.',
    accent: '#00FBFB',
  },
];

export default function IntroPage() {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [swiper, setSwiper] = useState(null);

  const isLast = active === SLIDES.length - 1;
  const slide = SLIDES[active];

  function onNext() {
    if (isLast) {
      router.replace('/login');
      return;
    }
    swiper?.slideNext();
  }

  function onClose() {
    router.replace('/login');
  }

  return (
    <div className="min-h-[100dvh] bg-night flex flex-col mx-auto max-w-md w-full">
      {/* Imagen full-width arriba */}
      <div className="relative h-[55vh] min-h-[360px] bg-black overflow-hidden">
        <Swiper
          onSwiper={setSwiper}
          onSlideChange={(s) => setActive(s.activeIndex)}
          slidesPerView={1}
          allowTouchMove
          className="h-full w-full"
        >
          {SLIDES.map((s, i) => (
            <SwiperSlide key={i} className="h-full w-full">
              <Image
                src={s.img}
                alt={s.title}
                fill
                priority={i === 0}
                sizes="(max-width: 768px) 100vw, 480px"
                className="object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          type="button"
          onClick={onClose}
          aria-label="Saltar introducción"
          className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30 transition"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
      </div>

      {/* Sección inferior negra */}
      <div className="flex-1 flex flex-col items-center justify-between px-8 pt-10 pb-12 text-center">
        <div>
          <h1 className="text-3xl font-bold text-white leading-tight">{slide.title}</h1>
          <p className="mt-6 text-base text-white/70 leading-relaxed">{slide.text}</p>
        </div>

        <div className="flex flex-col items-center gap-8 w-full">
          {/* Dots indicador */}
          <div className="flex items-center gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => swiper?.slideTo(i)}
                aria-label={`Ir al slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>

          {/* FAB circular con anillo de progreso */}
          <button
            type="button"
            onClick={onNext}
            aria-label={isLast ? 'Empezar' : 'Siguiente'}
            className="relative h-20 w-20 rounded-full bg-night flex items-center justify-center transition active:scale-95"
            style={{ boxShadow: `0 0 0 3px ${slide.accent}` }}
          >
            {/* Anillo decorativo (rotación lenta) */}
            <span
              className="absolute inset-[-6px] rounded-full border-2 animate-ring-spin"
              style={{ borderColor: `${slide.accent} transparent ${slide.accent} transparent` }}
              aria-hidden
            />
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={slide.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="13 6 19 12 13 18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
