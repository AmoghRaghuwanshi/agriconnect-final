'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore, type Order, type OrderStatus } from '@/store/orderStore';
import DashboardNav from '@/components/shared/DashboardNav';

type Tab = 'ALL' | 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

const statusBadge: Record<OrderStatus, string> = {
  PENDING: 'badge-amber', CONFIRMED: 'badge-blue', OUT_FOR_DELIVERY: 'badge-purple',
  DELIVERED: 'badge-green', COMPLETED: 'badge-gray', CANCELLED: 'badge-red', DISPUTED: 'badge-red',
};

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function FarmerOrdersPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { orders, confirmOrder, markOutForDelivery } = useOrderStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>('ALL');

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'FARMER')) router.push('/auth/farmer');
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !user) return null;

  const myOrders = orders.filter(o => o.farmerId === user.id);
  const filtered = tab === 'ALL' ? myOrders :
    tab === 'PENDING' ? myOrders.filter(o => o.orderStatus === 'PENDING') :
    tab === 'ACTIVE' ? myOrders.filter(o => ['CONFIRMED', 'OUT_FOR_DELIVERY'].includes(o.orderStatus)) :
    tab === 'COMPLETED' ? myOrders.filter(o => ['DELIVERED', 'COMPLETED'].includes(o.orderStatus)) :
    myOrders.filter(o => ['CANCELLED', 'DISPUTED'].includes(o.orderStatus));

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <DashboardNav />
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Orders</h1>

        <div className="tabs" style={{ marginBottom: '1.5rem' }}>
          {(['ALL', 'PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as Tab[]).map(t => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ fontSize: '3rem' }}>📦</div>
            <div className="empty-state-title">No orders yet</div>
            <div className="empty-state-text">Aapki listings active hain — jald hi orders aayenge!</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map(o => (
              <Link key={o.id} href={`/farmer/orders/${o.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card-flat" style={{ padding: '1.25rem', cursor: 'pointer', transition: 'box-shadow 0.15s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.boxShadow = 'none')}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 700 }}>{o.id}</span>
                      <span className={`badge ${statusBadge[o.orderStatus]}`}>
                        {o.orderStatus === 'PENDING' ? '⚡ ' : ''}{o.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {o.buyerName} · {o.cropName} ({o.quantityKg} kg)
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {timeAgo(o.createdAt)} · {o.orderType}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--green-900)', fontSize: '1.1rem' }}>₹{o.totalAmount.toLocaleString()}</div>
                    {o.orderStatus === 'PENDING' && (
                      <button className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }}
                        onClick={(e) => { e.preventDefault(); confirmOrder(o.id); }}>
                        Accept ✓
                      </button>
                    )}
                    {o.orderStatus === 'CONFIRMED' && (
                      <button className="btn btn-sm" style={{ marginTop: '0.5rem', background: '#7C3AED', color: '#fff' }}
                        onClick={(e) => { e.preventDefault(); markOutForDelivery(o.id); }}>
                        Ship 🚚
                      </button>
                    )}
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
