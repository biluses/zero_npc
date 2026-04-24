'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';
import { postsApi, notificationsApi } from '@/services/domainApi';
import { FriendsAdd } from '@/components/brand/icons';

/**
 * Community — XD `Community Home.png`.
 * Header personalizado: friends-add | "Comunidad" | filtro+lupa
 * Search bar: "¿Sobre qué quieres publicar?" + estrella amarilla → /post/new
 * Feed paginado con cards de posts.
 */
export default function CommunityPage() {
  return (
    <AuthGuard>
      <CommunityContent />
    </AuthGuard>
  );
}

function CommunityContent() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState({ hasMore: false, offset: 0, limit: 20, total: 0 });
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const sentinelRef = useRef(null);

  const load = useCallback(async (offset = 0) => {
    setLoading(true);
    try {
      const res = await postsApi.list({ limit: 20, offset });
      setPosts((prev) => (offset === 0 ? res.items : [...prev, ...res.items]));
      setMeta(res.meta || { hasMore: false, offset, limit: 20, total: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(0);
    notificationsApi.unreadCount().then((r) => setUnread(r.count || 0)).catch(() => {});
  }, [load]);

  // Infinite scroll con IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current || !meta.hasMore || loading) return undefined;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) load(meta.offset + meta.limit);
      },
      { rootMargin: '120px' },
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [meta, loading, load]);

  async function toggleLike(postId) {
    try {
      const r = await postsApi.like(postId);
      setPosts((p) =>
        p.map((post) =>
          post.id === postId
            ? { ...post, isLiked: r.liked, likeCount: post.likeCount + (r.liked ? 1 : -1) }
            : post,
        ),
      );
    } catch (err) {
      toast.error('No se pudo actualizar el like');
    }
  }

  return (
    <AppShell header={null} unreadCount={unread}>
      {/* Header personalizado XD */}
      <header className="app-header-tabbed">
        <Link href="/people" aria-label="Buscar gente" className="-ml-1 p-2 text-night hover:opacity-70">
          <FriendsAdd size={26} />
        </Link>
        <h1 className="app-title">Comunidad</h1>
        <Link href="/notifications" aria-label="Notificaciones" className="relative -mr-1 p-2 text-night hover:opacity-70">
          <BellSvg />
          {unread > 0 && (
            <span className="absolute right-1 top-1.5 h-2.5 w-2.5 rounded-full bg-magenta ring-2 ring-white" />
          )}
        </Link>
      </header>

      {/* Search bar publicar */}
      <div className="px-4 mt-2">
        <button
          type="button"
          onClick={() => router.push('/post/new')}
          className="input-pill text-left flex items-center justify-between text-text-muted"
        >
          <span>¿Sobre qué quieres publicar?</span>
          <span className="text-yellow text-xl">★</span>
        </button>
      </div>

      {/* Feed */}
      <div className="px-4 mt-4 space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onLike={() => toggleLike(post.id)} onOpen={() => router.push(`/post/${post.id}`)} />
        ))}

        {posts.length === 0 && !loading && (
          <div className="card-soft p-6 text-center text-text-muted text-sm">
            Aún no hay publicaciones.{' '}
            <button type="button" onClick={() => router.push('/post/new')} className="link-magenta">
              Sé el primero
            </button>
          </div>
        )}

        {loading && <p className="text-center text-sm text-text-muted py-3">Cargando…</p>}
        {meta.hasMore && <div ref={sentinelRef} className="h-6" />}
      </div>
    </AppShell>
  );
}

function PostCard({ post, onLike, onOpen }) {
  return (
    <article className="card-soft">
      <header className="flex items-center gap-2 mb-3">
        <div className="h-9 w-9 rounded-full bg-white overflow-hidden flex items-center justify-center">
          {post.author?.profilePicture ? (
            <Image src={post.author.profilePicture} alt="" width={36} height={36} className="object-cover h-full w-full" />
          ) : (
            <span className="text-xs font-bold">{(post.author?.username || '??').slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <span className="font-medium text-night">{post.author?.username || 'usuario'}</span>
        <span className="text-xs text-text-muted ml-auto">{relTime(post.createdAt)}</span>
      </header>

      {post.imageUrl && (
        <button type="button" onClick={onOpen} className="block w-full mb-3 rounded-xl overflow-hidden bg-white">
          <Image src={post.imageUrl} alt="" width={500} height={400} className="object-cover w-full" />
        </button>
      )}

      <button type="button" onClick={onOpen} className="text-left w-full">
        <p className="text-sm text-night whitespace-pre-wrap line-clamp-6">{post.caption}</p>
      </button>

      <footer className="mt-3 inline-flex items-center gap-2 bg-white rounded-full px-1 py-1">
        <button
          type="button"
          onClick={onLike}
          className={`px-3 py-1.5 text-xs rounded-full font-medium transition ${
            post.isLiked ? 'bg-magenta/10 text-magenta' : 'text-text-muted hover:bg-surface'
          }`}
          aria-pressed={post.isLiked}
          aria-label="Me gusta"
        >
          {post.isLiked ? '♥' : '♡'} Me Gusta {post.likeCount > 0 && `(${post.likeCount})`}
        </button>
        <button
          type="button"
          onClick={onOpen}
          className="px-3 py-1.5 text-xs rounded-full font-medium text-text-muted hover:bg-surface"
        >
          💬 Comentar {post.commentCount > 0 && `(${post.commentCount})`}
        </button>
      </footer>
    </article>
  );
}

function BellSvg() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a1 1 0 011 1v.6a7 7 0 016 6.9v3.5l1.5 2.5a1 1 0 01-.86 1.5H4.36a1 1 0 01-.86-1.5L5 14V10.5a7 7 0 016-6.9V3a1 1 0 011-1zM10 20h4a2 2 0 11-4 0z" />
    </svg>
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
