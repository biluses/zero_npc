'use client';

import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';
import { clearCredentials } from '@/store/slices/authSlice';
import Link from 'next/link';

export default function ProfilePage() {
  return (
    <AuthGuard>
      <AppShell>
        <Inner />
      </AppShell>
    </AuthGuard>
  );
}

function Inner() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const router = useRouter();

  function logout() {
    dispatch(clearCredentials());
    router.replace('/login');
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <p className="text-xs text-white/60">Usuario</p>
        <p className="text-lg font-semibold">{user?.username || user?.email}</p>
        <p className="text-xs text-white/60">{user?.email}</p>
      </div>

      <ul className="space-y-2">
        <li className="card">
          <Link href="/chat" className="flex items-center justify-between">
            <span className="text-sm font-medium">Mensajes</span>
            <span>›</span>
          </Link>
        </li>
        <li className="card">
          <Link href="/orders" className="flex items-center justify-between">
            <span className="text-sm font-medium">Mis pedidos</span>
            <span>›</span>
          </Link>
        </li>
      </ul>

      <button className="btn-secondary w-full" onClick={logout}>
        Cerrar sesión
      </button>
    </div>
  );
}
