'use client';

/**
 * Scanner abstraction layer.
 *
 * PLATFORM SUPPORT (MVP):
 *  - Android Chrome/Edge: Web NFC (`NDEFReader`) available → preferred.
 *  - iOS Safari: no Web NFC. Falls back to QR via camera.
 *  - Desktop: no NFC. Falls back to QR via webcam.
 *
 * PHASE 2 (Capacitor):
 *  - Swap `readOnce` with a native bridge (`@capacitor-community/nfc`) so iOS +
 *    Android both scan NFC natively. This file is the single place to change.
 *
 * The public contract is a single function `readOnce({ preferred })` that
 * returns `{ value, method }` or throws with a typed reason.
 */

export const SCAN_METHOD = { NFC: 'nfc', QR: 'qr' };

export function hasWebNfc() {
  return typeof window !== 'undefined' && 'NDEFReader' in window;
}

export function supportsCamera() {
  return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
}

export class ScannerError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

/**
 * Reads one NFC tag using Web NFC.
 * Rejects on permission denial, cancellation or if Web NFC is not supported.
 */
export async function readNfcOnce({ signal } = {}) {
  if (!hasWebNfc()) throw new ScannerError('NFC_UNSUPPORTED', 'Web NFC no disponible');
  const ndef = new window.NDEFReader();
  try {
    await ndef.scan({ signal });
  } catch (err) {
    throw new ScannerError('NFC_SCAN_FAILED', err.message || 'NFC scan error');
  }

  return new Promise((resolve, reject) => {
    const onReading = (event) => {
      const { serialNumber, message } = event;
      let text = serialNumber || '';
      if (message?.records?.length) {
        try {
          const record = message.records[0];
          const decoder = new TextDecoder(record.encoding || 'utf-8');
          const decoded = decoder.decode(record.data);
          if (decoded) text = decoded;
        } catch {
          /* ignore decode errors, keep serialNumber */
        }
      }
      cleanup();
      resolve({ value: String(text), method: SCAN_METHOD.NFC });
    };
    const onError = (err) => {
      cleanup();
      reject(new ScannerError('NFC_SCAN_FAILED', err?.message || 'NFC error'));
    };
    const cleanup = () => {
      ndef.removeEventListener('reading', onReading);
      ndef.removeEventListener('readingerror', onError);
      signal?.removeEventListener?.('abort', onAbort);
    };
    const onAbort = () => {
      cleanup();
      reject(new ScannerError('ABORTED', 'Scan aborted'));
    };

    ndef.addEventListener('reading', onReading);
    ndef.addEventListener('readingerror', onError);
    signal?.addEventListener?.('abort', onAbort);
  });
}
