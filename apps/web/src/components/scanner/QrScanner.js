'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { DecodeHintType, BarcodeFormat } from '@zxing/library';

/**
 * Inline QR code scanner using the device camera.
 *
 * Uses `@zxing/browser` for cross-platform decoding. Attempts the rear camera
 * with `facingMode: 'environment'` first and falls back to any device.
 */
export default function QrScanner({ onResult, onError }) {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const [status, setStatus] = useState('starting');

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
        const reader = new BrowserMultiFormatReader(hints);
        setStatus('ready');

        controlsRef.current = await reader.decodeFromVideoDevice(
          { facingMode: { ideal: 'environment' } },
          videoRef.current,
          (result, err, controls) => {
            if (cancelled) return;
            if (result) {
              controls.stop();
              onResult?.(result.getText());
            }
          },
        );
      } catch (err) {
        setStatus('error');
        onError?.(err);
      }
    }

    start();
    return () => {
      cancelled = true;
      try {
        controlsRef.current?.stop?.();
      } catch {
        /* ignore */
      }
    };
  }, [onResult, onError]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl2 bg-black aspect-square">
      <video ref={videoRef} className="h-full w-full object-cover" muted playsInline autoPlay />
      <div className="pointer-events-none absolute inset-6 rounded-xl border-2 border-brand-400/80" />
      {status === 'starting' && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-white/70">
          Iniciando cámara…
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-red-300">
          No se pudo acceder a la cámara. Concede permisos y recarga la página.
        </div>
      )}
    </div>
  );
}
