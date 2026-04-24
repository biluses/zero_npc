'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';
import Scanner from '@/components/scanner/Scanner';
import { tokensApi } from '@/services/domainApi';

export default function ScanPage() {
  return (
    <AuthGuard>
      <AppShell hideNav={false}>
        <ScanContent />
      </AppShell>
    </AuthGuard>
  );
}

function ScanContent() {
  const router = useRouter();

  async function handleScan({ value, method }) {
    try {
      const token = await tokensApi.lookup(value);
      toast.success(`Pin reconocido: ${token.product?.name}`);
      router.push(`/token/${token.id}`);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) {
        toast('Pin no registrado. Regístralo asociando un producto.', { icon: '📎' });
        router.push(`/scan/register?tagUid=${encodeURIComponent(value)}&method=${method}`);
      } else {
        toast.error(err?.response?.data?.message || 'Error al consultar');
      }
    }
  }

  return <Scanner mode="auto" onScan={handleScan} onClose={() => router.back()} />;
}
