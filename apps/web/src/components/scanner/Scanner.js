'use client';

import { useCallback, useEffect, useState } from 'react';
import { hasWebNfc, readNfcOnce, SCAN_METHOD } from '@/lib/scanner';
import QrScanner from './QrScanner';

/**
 * Unified scanner UI.
 *
 * Modes:
 *   - `auto`  → prefer NFC on Android (Web NFC), otherwise QR camera.
 *   - `nfc`   → force NFC (useful when scanning pins).
 *   - `qr`    → force QR camera.
 *
 * Callback: `onScan({ value, method })`.
 */
export default function Scanner({ mode = 'auto', onScan, onClose }) {
  const [activeMode, setActiveMode] = useState(() => pickInitialMode(mode));
  const [error, setError] = useState(null);
  const [abortController, setAbortController] = useState(null);

  const runNfc = useCallback(async () => {
    setError(null);
    const controller = new AbortController();
    setAbortController(controller);
    try {
      const result = await readNfcOnce({ signal: controller.signal });
      onScan?.(result);
    } catch (err) {
      if (err.code === 'ABORTED') return;
      setError(err.message || 'Error NFC');
    }
  }, [onScan]);

  useEffect(() => {
    if (activeMode === SCAN_METHOD.NFC) runNfc();
    return () => abortController?.abort?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMode]);

  const handleQrResult = useCallback(
    (text) => onScan?.({ value: text, method: SCAN_METHOD.QR }),
    [onScan],
  );

  return (
    <div className="container-app py-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Escanear</h2>
        {onClose && (
          <button className="btn-ghost" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        )}
      </div>

      <div className="mb-4 flex gap-2">
        <button
          className={activeMode === SCAN_METHOD.NFC ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveMode(SCAN_METHOD.NFC)}
          disabled={!hasWebNfc()}
          title={!hasWebNfc() ? 'NFC no disponible en este dispositivo' : undefined}
        >
          NFC {hasWebNfc() ? '' : '(no disponible)'}
        </button>
        <button
          className={activeMode === SCAN_METHOD.QR ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveMode(SCAN_METHOD.QR)}
        >
          QR
        </button>
      </div>

      {activeMode === SCAN_METHOD.NFC && (
        <div className="card">
          <p className="text-sm text-white/80">
            Acerca el pin NFC a la parte superior de tu móvil Android.
          </p>
          <div className="my-6 flex h-40 items-center justify-center text-5xl">📡</div>
          {error && <p className="text-sm text-red-300">{error}</p>}
          <button className="btn-secondary mt-2 w-full" onClick={runNfc}>
            Reintentar
          </button>
        </div>
      )}

      {activeMode === SCAN_METHOD.QR && (
        <QrScanner
          onResult={handleQrResult}
          onError={(err) => setError(err?.message || 'Error cámara')}
        />
      )}
    </div>
  );
}

function pickInitialMode(preferred) {
  if (preferred === SCAN_METHOD.NFC && hasWebNfc()) return SCAN_METHOD.NFC;
  if (preferred === SCAN_METHOD.QR) return SCAN_METHOD.QR;
  return hasWebNfc() ? SCAN_METHOD.NFC : SCAN_METHOD.QR;
}
