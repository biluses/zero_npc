'use client';

import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';
import Modal from '@/components/feedback/Modal';
import { tokensApi, friendsApi, exchangesApi } from '@/services/domainApi';
import TokenSentModal from '@/components/modals/TokenSentModal';
import { BoxToken } from '@/components/brand/icons';

const MAX_MSG = 140;

/**
 * Send Token — XD `Send Token.png` y `Send Token (Friend Chosen).png`.
 *
 * Flujo:
 *  - Selecciona uno o varios tokens (filtrados por productId si viene en query).
 *  - Elige amigo (abre ChooseFriendModal con grid de avatares).
 *  - Mensaje opcional (140 chars).
 *  - CTA amarilla "Enviar" → exchanges.initiate (1 por token).
 *  - Tras éxito → TokenSentModal.
 */
export default function TokenSendPage() {
  return (
    <AuthGuard>
      <Suspense>
        <Content />
      </Suspense>
    </AuthGuard>
  );
}

function Content() {
  const router = useRouter();
  const params = useSearchParams();
  const filterProductId = params.get('productId') || null;

  const [tokens, setTokens] = useState([]);
  const [selectedTokenIds, setSelectedTokenIds] = useState([]);
  const [friend, setFriend] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chooseFriendOpen, setChooseFriendOpen] = useState(false);
  const [sentOpen, setSentOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await tokensApi.list();
        let items = Array.isArray(r) ? r : r.items || [];
        if (filterProductId) items = items.filter((t) => t.productId === filterProductId);
        setTokens(items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [filterProductId]);

  function toggleToken(id) {
    setSelectedTokenIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function onSend() {
    if (!selectedTokenIds.length) return toast.error('Selecciona al menos un token');
    if (!friend) return toast.error('Elige un amigo');
    setSending(true);
    try {
      // 1 exchange por token
      for (const tokenId of selectedTokenIds) {
        await exchangesApi.initiate({
          tokenId,
          recipientId: friend.id,
          message: message.trim() || undefined,
        });
      }
      setSentOpen(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'No se pudo enviar');
    } finally {
      setSending(false);
    }
  }

  return (
    <AppShell hideNav header="back" title="Enviar">
      <div className="px-4 pt-2 space-y-4 pb-8">
        {/* Selector de tokens */}
        <section className="card-soft p-5">
          <div className="flex items-center justify-center gap-2 mb-2">
            {selectedTokenIds.slice(0, 5).map((id) => <BoxToken key={id} size={36} />)}
            {selectedTokenIds.length === 0 && (
              <>
                <BoxToken size={36} className="opacity-40" />
                <BoxToken size={36} className="opacity-40" />
              </>
            )}
          </div>
          <p className="text-center font-bold text-night">
            {selectedTokenIds.length} token(s) seleccionados
          </p>
          {tokens.length > 0 && (
            <div className="mt-3 max-h-44 overflow-y-auto space-y-1 border-t border-border-soft pt-2">
              {tokens.map((t) => (
                <label key={t.id} className="flex items-center gap-2 text-sm py-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTokenIds.includes(t.id)}
                    onChange={() => toggleToken(t.id)}
                    className="h-4 w-4"
                  />
                  <span className="text-night truncate">{t.product?.name || 'Token'} · {t.tagUid?.slice(0, 8)}</span>
                </label>
              ))}
            </div>
          )}
          {!loading && tokens.length === 0 && (
            <p className="mt-2 text-sm text-text-muted text-center">No tienes tokens disponibles</p>
          )}
        </section>

        {/* Selector de amigo */}
        <button
          type="button"
          onClick={() => setChooseFriendOpen(true)}
          className="card-soft w-full flex items-center gap-3 hover:bg-border-soft transition"
        >
          <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center text-night font-bold">
            {friend ? '✓' : '+'}
          </div>
          <span className="font-medium text-night">{friend ? friend.username : 'Elige un amigo'}</span>
          <span className="ml-auto text-text-muted">›</span>
        </button>

        {/* Mensaje */}
        <div className="card-soft">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, MAX_MSG))}
            placeholder="Escribe un mensaje"
            className="w-full bg-transparent outline-none text-sm text-night placeholder:text-text-muted h-20 resize-none"
          />
          <div className="text-right text-xs text-text-muted">{message.length}/{MAX_MSG}</div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md p-4 bg-white safe-bottom">
        <button type="button" onClick={onSend} disabled={sending} className="btn-yellow">
          {sending ? 'Enviando…' : 'Enviar'}
        </button>
      </div>

      {chooseFriendOpen && (
        <ChooseFriendModal
          onClose={() => setChooseFriendOpen(false)}
          onSelect={(f) => { setFriend(f); setChooseFriendOpen(false); }}
        />
      )}

      <TokenSentModal
        open={sentOpen}
        onClose={() => { setSentOpen(false); router.replace('/tokens'); }}
        prefillCaption={friend ? `Acabo de enviar un token a @${friend.username}` : ''}
      />
    </AppShell>
  );
}

function ChooseFriendModal({ onClose, onSelect }) {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const r = await friendsApi.discover({ q: q.trim(), limit: 30 });
        setItems(r.items || []);
      } catch (err) {
        console.error(err);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <Modal open onClose={onClose} ariaLabel="Elegir amigo">
      <h2 className="text-lg font-bold text-night mb-3">Elige un amigo</h2>
      <input
        className="input-pill mb-3"
        placeholder="Buscar"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="max-h-72 overflow-y-auto grid grid-cols-4 gap-3">
        {items.map((u) => (
          <button
            key={u.id}
            type="button"
            onClick={() => onSelect(u)}
            className="flex flex-col items-center hover:opacity-80"
          >
            <div className="relative">
              <div className="h-14 w-14 rounded-full overflow-hidden bg-surface flex items-center justify-center">
                {u.profilePicture ? (
                  <Image src={u.profilePicture} alt="" width={56} height={56} className="object-cover h-full w-full" />
                ) : (
                  <span className="text-xs font-bold text-text-muted">{(u.username || '??').slice(0, 2).toUpperCase()}</span>
                )}
              </div>
            </div>
            <span className="mt-1 text-[10px] text-night truncate w-full text-center">{u.username}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
