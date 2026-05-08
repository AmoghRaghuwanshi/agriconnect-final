'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore, type OrderStatus } from '@/store/orderStore';
import DashboardNav from '@/components/shared/DashboardNav';

const statusBadge: Record<OrderStatus, string> = {
  PENDING: 'badge-amber', CONFIRMED: 'badge-blue', OUT_FOR_DELIVERY: 'badge-purple',
  DELIVERED: 'badge-green', COMPLETED: 'badge-gray', CANCELLED: 'badge-red', DISPUTED: 'badge-red',
};

export default function AdminOrdersPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { orders } = useOrderStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'ADMIN')) router.push('/auth/admin');
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !user) return null;

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <DashboardNav />
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>📦 All Platform Orders ({orders.length})</h1>
        <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                {['ID', 'Type', 'Crop', 'Buyer', 'Farmer', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.75rem 0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--border)', background: o.orderStatus === 'DISPUTED' ? 'rgba(220,38,38,0.05)' : 'transparent' }}>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>{o.id}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}><span className={`badge ${o.orderType === 'B2B' ? 'badge-purple' : 'badge-blue'}`}>{o.orderType}</span></td>
                  <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem' }}>{o.cropName}</td>
                  <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem' }}>{o.buyerName}</td>
                  <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem' }}>{o.farmName}</td>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: 'var(--green-900)' }}>₹{o.totalAmount.toLocaleString()}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}><span className={`badge ${statusBadge[o.orderStatus]}`}>{o.orderStatus.replace(/_/g, ' ')}</span></td>
                  <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
