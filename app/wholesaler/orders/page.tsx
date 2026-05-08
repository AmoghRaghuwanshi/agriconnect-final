'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore, type OrderStatus } from '@/store/orderStore';
import DashboardNav from '@/components/shared/DashboardNav';

const statusBadge: Record<OrderStatus, string> = {
  PENDING: 'badge-amber', CONFIRMED: 'badge-blue', OUT_FOR_DELIVERY: 'badge-purple',
  DELIVERED: 'badge-green', COMPLETED: 'badge-gray', CANCELLED: 'badge-red', DISPUTED: 'badge-red',
};

export default function WholesalerOrdersPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { orders } = useOrderStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'WHOLESALER')) router.push('/auth/wholesaler');
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !user) return null;

  const myOrders = orders.filter(o => o.buyerId === user.id);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <DashboardNav />
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Bulk Orders</h1>
        {myOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ fontSize: '3rem' }}>📦</div>
            <div className="empty-state-title">No orders yet</div>
            <Link href="/marketplace" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Marketplace</Link>
          </div>
        ) : (
          <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  {['Order ID', 'Crop', 'Farmer', 'Qty', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.75rem 0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {myOrders.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>{o.id}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem' }}>{o.cropName}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem' }}>{o.farmName}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem' }}>{o.quantityKg} kg</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--green-900)' }}>₹{o.totalAmount.toLocaleString()}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}><span className={`badge ${statusBadge[o.orderStatus]}`}>{o.orderStatus.replace(/_/g, ' ')}</span></td>
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
