'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore, type OrderStatus } from '@/store/orderStore';
import DashboardNav from '@/components/shared/DashboardNav';

type Tab = 'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

const statusBadge: Record<OrderStatus, string> = {
  PENDING: 'badge-amber', CONFIRMED: 'badge-blue', OUT_FOR_DELIVERY: 'badge-purple',
  DELIVERED: 'badge-green', COMPLETED: 'badge-gray', CANCELLED: 'badge-red', DISPUTED: 'badge-red',
};

export default function ConsumerOrdersPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { orders } = useOrderStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>('ALL');

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && !isAuthenticated) router.push('/auth/consumer');
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !user) return null;

  const myOrders = orders.filter(o => o.buyerId === user.id);
  const filtered = tab === 'ALL' ? myOrders :
    tab === 'ACTIVE' ? myOrders.filter(o => ['PENDING', 'CONFIRMED', 'OUT_FOR_DELIVERY'].includes(o.orderStatus)) :
    tab === 'COMPLETED' ? myOrders.filter(o => ['DELIVERED', 'COMPLETED'].includes(o.orderStatus)) :
    myOrders.filter(o => ['CANCELLED', 'DISPUTED'].includes(o.orderStatus));

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <DashboardNav />
      <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>📦 My Orders</h1>

        <div className="tabs" style={{ marginBottom: '1.5rem' }}>
          {(['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as Tab[]).map(t => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ fontSize: '3rem' }}>📦</div>
            <div className="empty-state-title">No orders found</div>
            <div className="empty-state-text">Browse the marketplace to place your first order!</div>
            <Link href="/marketplace" className="btn btn-primary" style={{ marginTop: '1rem' }}>Shop Now</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map(o => (
              <Link key={o.id} href={`/orders/${o.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card-flat" style={{ padding: '1.25rem', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.boxShadow = 'none')}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700 }}>{o.id}</span>
                      <span className={`badge ${statusBadge[o.orderStatus]}`}>{o.orderStatus.replace(/_/g, ' ')}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--green-900)' }}>₹{o.totalAmount.toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {o.cropName} ({o.quantityKg} kg) from {o.farmName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
