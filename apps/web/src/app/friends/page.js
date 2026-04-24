'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';
import { friendsApi } from '@/services/domainApi';
import AddFriendModal from '@/components/modals/AddFriendModal';

/**
 * Friends — XD `Me - Friends.png`.
 * Header back + "Amigos".
 * Search bar + grid 4 cols de avatares con dot cyan online.
 * Tap en avatar abre <AddFriendModal>.
 */
export default function FriendsPage() {
  return (
    <AuthGuard>
      <FriendsContent />
    </AuthGuard>
  );
}

function FriendsContent() {
  const router = useRouter();
  const onlineSet = useSelector((s) => s.presence.online);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  async function load(q = '') {
    setLoading(true);
    try {
      // Por defecto muestra discover (todos los usuarios) + indica relación.
      // Si está vacío y no buscamos nada, listamos amigos aceptados.
      if (!q) {
        const res = await friendsApi.list({ status: 'accepted' });
        setItems(res.items.map((r) => ({ ...r.friend, relationship: 'accepted' })));
      } else {
        const res = await friendsApi.discover({ q });
        setItems(res.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => load(search.trim()), 250);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <AppShell header="back" title="Amigos">
      <div className="px-4 pt-2">
        <input
          className="input-pill"
          type="search"
          placeholder="Buscar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="px-4 pt-5 grid grid-cols-4 gap-x-3 gap-y-5">
        {items.map((u) => (
          <button
            key={u.id}
            type="button"
            onClick={() => setSelected(u)}
            className="flex flex-col items-center gap-1 hover:opacity-80"
          >
            <div className="relative">
              <div className="h-16 w-16 rounded-full overflow-hidden bg-surface flex items-center justify-center">
                {u.profilePicture ? (
                  <Image src={u.profilePicture} alt="" width={64} height={64} className="object-cover h-full w-full" />
                ) : (
                  <span className="text-sm font-bold text-text-muted">
                    {(u.username || '??').slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              {/* dot cyan: conectado al slice `presence` (socket users:online) */}
              {onlineSet.includes(u.id) && (
                <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full bg-cyan ring-2 ring-white" />
              )}
            </div>
          </button>
        ))}
      </div>

      {!loading && items.length === 0 && (
        <p className="text-center text-text-muted text-sm py-8 px-4">
          {search ? 'Sin resultados' : 'Aún no tienes amigos'}
        </p>
      )}

      {selected && (
        <AddFriendModal
          user={selected}
          onClose={() => setSelected(null)}
          onAdded={() => {
            toast.success('Solicitud enviada');
            setSelected(null);
            load(search.trim());
          }}
        />
      )}
    </AppShell>
  );
}
