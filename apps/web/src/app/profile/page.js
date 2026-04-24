'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';
import { tokensApi, exchangesApi, postsApi, friendsApi, notificationsApi } from '@/services/domainApi';
import { authApi } from '@/services/authApi';
import { setUser } from '@/store/slices/authSlice';
import { BoxTokenUp, BoxTokenDown, FireFlame } from '@/components/brand/icons';

/**
 * Profile (Yo) — XD `Welcome - Home (General).PNG` y `Welcome - Home (Posts).png`.
 *
 * Layout:
 *   - AppHeaderTabbed (hamburger | logo | bell con dot magenta)
 *   - Avatar centrado + dot cyan + username con icono fire magenta
 *   - Tabs General | Publicaciones
 *   - General: stats, friends pill, armario horizontal scroll
 *   - Publicaciones: feed onlyMine
 *
 * Tachados respetados: NO level "12 FT • Novata", NO rating, NO logros.
 */
export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}

function ProfileContent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);

  const [tab, setTab] = useState('general');
  const [unread, setUnread] = useState(0);
  const [stats, setStats] = useState({ sent: 0, received: 0, friends: 0 });
  const [tokens, setTokens] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [me, tokensRes, inbox, outbox, friendsRes, postsRes, unreadRes] = await Promise.all([
        authApi.me(),
        tokensApi.list(),
        exchangesApi.list('inbox'),
        exchangesApi.list('outbox'),
        friendsApi.list({ status: 'accepted' }),
        postsApi.list({ onlyMine: true }),
        notificationsApi.unreadCount(),
      ]);
      if (me?.user) dispatch(setUser(me.user));
      setStats({
        sent: outbox.length || 0,
        received: inbox.length || 0,
        friends: friendsRes.meta?.total ?? friendsRes.items?.length ?? 0,
      });
      // tokensApi.list devuelve un array directamente (no paginado)
      const tokenItems = Array.isArray(tokensRes) ? tokensRes : tokensRes.items || [];
      setTokens(tokenItems);
      setPosts(postsRes.items || []);
      setUnread(unreadRes.count || 0);
    } catch (err) {
      // 401 ya gestionado en interceptor
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const username = user?.username || (user?.email || '').split('@')[0] || 'tú';
  const avatarUrl = user?.profilePicture || '/images/profile.jpg';
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <AppShell unreadCount={unread}>
      <div className="flex flex-col items-center pt-2 pb-6 px-4">
        <div className="relative">
          <div className="h-28 w-28 rounded-full overflow-hidden bg-surface flex items-center justify-center">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={username} width={112} height={112} className="object-cover h-full w-full" />
            ) : (
              <span className="text-3xl font-bold text-text-muted">{initials}</span>
            )}
          </div>
          <span className="absolute right-1 top-1 h-3 w-3 rounded-full bg-cyan ring-2 ring-white" aria-label="online" />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <FireFlame size={26} />
          <h1 className="text-2xl font-bold text-night">{username}</h1>
        </div>
        {/* NO mostramos level/rating - tachados en XD */}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-8 px-4 border-b border-border-soft">
        <TabButton active={tab === 'general'} onClick={() => setTab('general')}>General</TabButton>
        <TabButton active={tab === 'posts'} onClick={() => setTab('posts')}>Publicaciones</TabButton>
      </div>

      {tab === 'general' && (
        <div className="px-4 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={<BoxTokenUp size={40} />}
              count={stats.sent}
              label="Tokens enviados"
              onClick={() => router.push('/tokens')}
            />
            <StatCard
              icon={<BoxTokenDown size={40} />}
              count={stats.received}
              label="Tokens recibidos"
              onClick={() => router.push('/tokens')}
            />
          </div>

          {/* NO card "Logros" - tachado en XD */}

          <button
            type="button"
            onClick={() => router.push('/friends')}
            className="card-soft w-full flex items-center justify-between hover:bg-border-soft transition"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-surface flex items-center justify-center text-night font-bold">
                {stats.friends}
              </div>
              <span className="font-medium text-night">Amigos</span>
            </div>
            <span className="text-text-muted">›</span>
          </button>

          <section>
            <div className="flex items-center justify-between px-1 mb-2">
              <h2 className="text-lg font-bold text-night">Armario</h2>
              <Link href="/wardrobe" className="link-magenta text-sm">{tokens.length} prendas</Link>
            </div>
            {tokens.length > 0 ? (
              <div className="card-soft p-3">
                <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
                  {tokens.slice(0, 6).map((t) => (
                    <Link
                      href={`/token/${t.id}`}
                      key={t.id}
                      className="shrink-0 w-24"
                    >
                      <div className="h-24 w-24 rounded-xl bg-white overflow-hidden flex items-center justify-center border border-border-soft">
                        {t.product?.imageUrl ? (
                          <Image src={t.product.imageUrl} alt={t.product?.name || ''} width={96} height={96} className="object-cover h-full w-full" />
                        ) : (
                          <span className="text-text-muted text-xs">Sin imagen</span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-night line-clamp-2 text-center">{t.product?.name || 'Token'}</p>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card-soft p-6 text-center text-text-muted text-sm">
                Aún no tienes tokens. <Link href="/scan" className="link-magenta">Escanea uno</Link> para empezar.
              </div>
            )}
          </section>

          {loading && <p className="text-center text-sm text-text-muted">Cargando…</p>}
        </div>
      )}

      {tab === 'posts' && (
        <div className="px-4 py-5">
          {posts.length > 0 ? (
            <div className="space-y-3">
              {posts.map((p) => (
                <PostMiniCard key={p.id} post={p} onClick={() => router.push(`/post/${p.id}`)} />
              ))}
            </div>
          ) : (
            <div className="card-soft p-6 text-center text-text-muted text-sm">
              Aún no has publicado nada.{' '}
              <Link href="/post/new" className="link-magenta">Crea tu primera publicación</Link>.
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pb-3 -mb-px font-medium transition ${
        active ? 'text-night border-b-2 border-yellow' : 'text-text-muted'
      }`}
    >
      <span className={active ? 'bg-yellow/40 px-2 rounded' : ''}>{children}</span>
    </button>
  );
}

function StatCard({ icon, count, label, onClick }) {
  return (
    <button type="button" onClick={onClick} className="card-soft py-5 flex flex-col items-center hover:bg-border-soft transition">
      <div>{icon}</div>
      <div className="mt-2 text-2xl font-bold text-night">{count}</div>
      <div className="text-sm text-text-muted">{label}</div>
    </button>
  );
}

function PostMiniCard({ post, onClick }) {
  return (
    <button type="button" onClick={onClick} className="card-soft w-full text-left">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-8 w-8 rounded-full bg-white overflow-hidden flex items-center justify-center">
          {post.author?.profilePicture ? (
            <Image src={post.author.profilePicture} alt="" width={32} height={32} className="object-cover h-full w-full" />
          ) : (
            <span className="text-xs font-bold">{(post.author?.username || '??').slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <span className="font-medium text-sm">{post.author?.username || 'tú'}</span>
        <span className="text-xs text-text-muted ml-auto">{relTime(post.createdAt)}</span>
      </div>
      <p className="text-sm text-night line-clamp-3">{post.caption}</p>
      <div className="mt-3 inline-flex items-center gap-3 bg-white rounded-full px-3 py-1.5 text-xs text-text-muted">
        <span>♥ {post.likeCount}</span>
        <span>💬 {post.commentCount}</span>
      </div>
    </button>
  );
}

function relTime(d) {
  if (!d) return '';
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 60) return 'ahora';
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
  return `${Math.floor(diff / 86400)} d`;
}
