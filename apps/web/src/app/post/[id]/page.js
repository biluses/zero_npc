'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-toastify';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';
import { postsApi } from '@/services/domainApi';

/**
 * PostDetails — pantalla de detalle de un post con comentarios.
 * No tiene XD específico; sigue el design system: header back, card del post, comentarios anidados, input fixed bottom.
 */
export default function PostDetailsPage() {
  return (
    <AuthGuard>
      <Content />
    </AuthGuard>
  );
}

function Content() {
  const router = useRouter();
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  async function load() {
    try {
      const [p, cs] = await Promise.all([postsApi.byId(id), postsApi.comments(id)]);
      setPost(p);
      setComments(cs);
    } catch (err) {
      toast.error('No se pudo cargar la publicación');
      router.back();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function onLike() {
    if (!post) return;
    const r = await postsApi.like(id).catch(() => null);
    if (r) setPost({ ...post, isLiked: r.liked, likeCount: post.likeCount + (r.liked ? 1 : -1) });
  }

  async function onSend(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await postsApi.addComment(id, { comment: text.trim() });
      setText('');
      load();
    } catch (err) {
      toast.error('No se pudo comentar');
    } finally {
      setSending(false);
    }
  }

  return (
    <AppShell hideNav header="back" title="Publicación">
      <div className="px-4 pt-2 pb-32">
        {post && (
          <article className="card-soft">
            <header className="flex items-center gap-2 mb-3">
              <Avatar user={post.author} />
              <span className="font-medium text-night">{post.author?.username}</span>
              <span className="text-xs text-text-muted ml-auto">{relTime(post.createdAt)}</span>
            </header>
            {post.imageUrl && (
              <div className="mb-3 rounded-xl overflow-hidden bg-white">
                <Image src={post.imageUrl} alt="" width={500} height={400} className="object-cover w-full" />
              </div>
            )}
            <p className="text-sm text-night whitespace-pre-wrap">{post.caption}</p>
            <button
              type="button"
              onClick={onLike}
              className={`mt-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium ${
                post.isLiked ? 'bg-magenta/10 text-magenta' : 'bg-white text-text-muted'
              }`}
            >
              {post.isLiked ? '♥' : '♡'} Me Gusta {post.likeCount > 0 && `(${post.likeCount})`}
            </button>
          </article>
        )}

        <h2 className="mt-5 mb-2 px-1 text-sm font-bold text-night">Comentarios</h2>
        {comments.length === 0 ? (
          <p className="text-text-muted text-sm px-1">Sé el primero en comentar.</p>
        ) : (
          <ul className="space-y-3">
            {comments.map((c) => (
              <CommentItem key={c.id} comment={c} />
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={onSend} className="fixed inset-x-0 bottom-0 mx-auto max-w-md bg-white border-t border-border-soft p-3 flex gap-2 safe-bottom">
        <input
          className="input-pill flex-1"
          placeholder="Escribe un comentario"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 500))}
        />
        <button type="submit" disabled={sending || !text.trim()} className="px-5 rounded-full bg-yellow font-bold text-night disabled:opacity-50">
          ↑
        </button>
      </form>

      {loading && <p className="text-center text-text-muted text-sm py-3">Cargando…</p>}
    </AppShell>
  );
}

function CommentItem({ comment }) {
  return (
    <li className="flex gap-2">
      <Avatar user={comment.author} small />
      <div className="flex-1 card-soft py-2 px-3">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm text-night">{comment.author?.username}</span>
          <span className="text-[10px] text-text-muted">{relTime(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-night whitespace-pre-wrap mt-0.5">{comment.comment}</p>
        {comment.replies?.length > 0 && (
          <ul className="mt-2 space-y-2 ml-3 border-l-2 border-border-soft pl-3">
            {comment.replies.map((r) => <CommentItem key={r.id} comment={r} />)}
          </ul>
        )}
      </div>
    </li>
  );
}

function Avatar({ user, small = false }) {
  const size = small ? 28 : 36;
  return (
    <div className="rounded-full overflow-hidden bg-white flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      {user?.profilePicture ? (
        <Image src={user.profilePicture} alt="" width={size} height={size} className="object-cover h-full w-full" />
      ) : (
        <span className="text-[10px] font-bold">{(user?.username || '??').slice(0, 2).toUpperCase()}</span>
      )}
    </div>
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
