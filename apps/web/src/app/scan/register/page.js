'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AuthGuard from '@/components/auth/AuthGuard';
import AppShell from '@/components/layout/AppShell';
import { productsApi, tokensApi } from '@/services/domainApi';

function RegisterInner() {
  const params = useSearchParams();
  const router = useRouter();
  const tagUid = params.get('tagUid') || '';
  const method = params.get('method') || 'nfc';
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    productsApi
      .list({ isPin: true })
      .then((data) => setProducts(data || []))
      .catch(() => toast.error('Error cargando productos'));
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    if (!productId) return;
    setLoading(true);
    try {
      const token = await tokensApi.register({ productId, tagUid, tagType: method });
      toast.success('Pin registrado');
      router.replace(`/token/${token.id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error registrando');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold">Registrar pin</h1>
      <p className="mt-1 text-xs text-white/60">UID: {tagUid}</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block text-white/70">Producto asociado</span>
          <select
            className="input"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            required
          >
            <option value="">Selecciona un producto…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <button className="btn-primary w-full" disabled={loading || !productId}>
          {loading ? 'Registrando…' : 'Registrar'}
        </button>
      </form>
    </div>
  );
}

export default function RegisterPinPage() {
  return (
    <AuthGuard>
      <AppShell>
        <Suspense>
          <RegisterInner />
        </Suspense>
      </AppShell>
    </AuthGuard>
  );
}
