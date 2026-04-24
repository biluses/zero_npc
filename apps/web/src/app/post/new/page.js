'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { toast } from 'react-toastify';
import AuthGuard from '@/components/auth/AuthGuard';
import { postsApi } from '@/services/domainApi';

const MAX = 140;

/**
 * MakePost — XD `Make Post.png`.
 * Title "Nueva publicación" + close X. Textarea 0/140. "Añadir una foto".
 *
 * Acepta query ?prefill=texto para flujo de "Token Sent" (sugiere caption).
 */
export default function MakePostPage() {
  return (
    <AuthGuard>
      <Suspense>
        <Form />
      </Suspense>
    </AuthGuard>
  );
}

function Form() {
  const router = useRouter();
  const params = useSearchParams();
  const prefill = params.get('prefill') || '';
  const [caption, setCaption] = useState(prefill);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  function onPickFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      return toast.error('Solo se aceptan JPG, PNG o WebP');
    }
    if (f.size > 5 * 1024 * 1024) return toast.error('Máx 5 MB');
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }

  async function onSubmit(e) {
    e?.preventDefault();
    if (!caption.trim() && !file) return toast.error('Escribe algo o añade una foto');
    setLoading(true);
    try {
      await postsApi.create({ caption: caption.trim(), image: file });
      toast.success('Publicación creada');
      router.replace('/community');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'No se pudo publicar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col mx-auto max-w-md w-full">
      <header className="app-header-back">
        <div />
        <h1 className="app-title text-center flex-1">Nueva publicación</h1>
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Cerrar"
          className="-mr-1 h-9 w-9 rounded-full bg-surface flex items-center justify-center text-night hover:bg-border-soft"
        >
          ✕
        </button>
      </header>

      <form onSubmit={onSubmit} className="flex-1 flex flex-col px-4 pb-6">
        <div className="card-white border-2 border-night/80 rounded-2xl p-4 min-h-[180px]">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, MAX))}
            placeholder="Acabo de enviar dos tokens [nombre / identificador del token] a @amigo y…"
            className="w-full h-40 resize-none bg-transparent outline-none text-night placeholder:text-text-muted text-sm"
          />
        </div>
        <div className="text-right text-xs text-text-muted mt-1">{caption.length}/{MAX}</div>

        <label className="card-soft mt-4 flex items-center gap-3 cursor-pointer hover:bg-border-soft transition">
          <span className="h-10 w-10 rounded-lg bg-white flex items-center justify-center">📷</span>
          <span className="text-sm text-night">{file ? file.name : 'Añadir una foto'}</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onPickFile} className="hidden" />
        </label>

        {previewUrl && (
          <div className="mt-3 rounded-xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="" className="w-full max-h-64 object-cover" />
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-yellow mt-auto">
          {loading ? 'Publicando…' : 'Publicar'}
        </button>
      </form>
    </div>
  );
}
