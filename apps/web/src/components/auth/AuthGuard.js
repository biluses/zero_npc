'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

export default function AuthGuard({ children }) {
  const router = useRouter();
  const accessToken = useSelector((s) => s.auth.accessToken);

  useEffect(() => {
    if (!accessToken) router.replace('/login');
  }, [accessToken, router]);

  if (!accessToken) return null;
  return children;
}
