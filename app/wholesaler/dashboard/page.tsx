'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore } from '@/store/orderStore';
import DashboardNav from '@/components/shared/DashboardNav';

export default function WholesalerDashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { orders } = useOrderStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'WHOLESALER')) {
      router.push('/auth/wholesaler');
      return;
    }
    if (mounted && isAuthenticated && user?.role === 'WHOLESALER') {
      useOrderStore.getState().fetchOrders({ buyerId: user.id });
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !user) return null;

  const myOrders = orders.filter(o => o.buyerId === user.id);
  const totalSpent = myOrders.filter(o => o.paymentStatus === 'PAID').reduce((s, o) => s + o.totalAmount, 0);
  const creditLimit = 75000;
  const available = creditLimit - 30500;

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <DashboardNav />
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          Welcome, {user.businessName || user.name}
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>B2B Marketplace</p>

        {/* Credit Card */}
        <Link href="/wholesaler/credit" style={{ textDecoration: 'none', color: 'inherit', display: 'block', position: 'relative', zIndex: 10 }}>
          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #0F172A, #1E293B)', color: '#fff', cursor: 'pointer', transition: 'transform 0.15s' }}
            onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.transform = 'scale(1.01)')}
            onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.transform = 'scale(1)')}>
            <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.5rem' }}>💳 Available Credit</div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>₹{available.toLocaleString()} <span style={{ fontSize: '0.9rem', opacity: 0.5 }}>/ ₹{creditLimit.toLocaleString()}</span></div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '999px', marginTop: '0.75rem', overflow: 'hidden' }}>
              <div style={{ width: `${Math.round((available / creditLimit) * 100)}%`, height: '100%', background: '#22C55E', borderRadius: '999px' }} />
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.5rem', textAlign: 'right' }}>View Full Ledger →</div>
          </div>
        </Link>

        {/* Stats */}
        <div className="bento bento-4" style={{ marginBottom: '2rem' }}>
          {[
            { value: String(myOrders.length), label: 'Orders This Month', href: '/wholesaler/orders' },
            { value: '2', label: 'Pending RFQs', href: '/wholesaler/rfq' },
            { value: '3', label: 'Standing Orders', href: '/wholesaler/orders' },
            { value: `₹${totalSpent.toLocaleString()}`, label: 'Total Purchased', href: '/wholesaler/credit' },
          ].map(s => (
            <Link key={s.label} href={s.href} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="stat-card" style={{ textAlign: 'center', cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s' }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          <Link href="/wholesaler/browse" className="btn btn-primary">🔍 Browse Farmers</Link>
          <Link href="/wholesaler/rfq" className="btn btn-outline">💬 RFQ</Link>
          <Link href="/wholesaler/orders" className="btn btn-outline">📦 Orders</Link>
          <Link href="/wholesaler/credit" className="btn btn-outline">💳 Credit</Link>
        </div>

        {/* Recent Orders */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.15rem', marginBottom: '1rem' }}>Recent Orders</h2>
          {myOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon" style={{ fontSize: '2rem' }}>📦</div>
              <div className="empty-state-title">No orders yet</div>
              <Link href="/wholesaler/browse" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>Browse Listings</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {myOrders.slice(0, 3).map(o => (
                <div key={o.id} className="card-flat" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{o.id} · {o.cropName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{o.farmName} · {o.quantityKg} kg</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--green-900)' }}>₹{o.totalAmount.toLocaleString()}</div>
                    <span className={`badge ${o.orderStatus === 'COMPLETED' ? 'badge-green' : 'badge-blue'}`}>{o.orderStatus.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              ))}
              <Link href="/wholesaler/orders" className="btn btn-ghost btn-sm" style={{ alignSelf: 'center' }}>View All Orders →</Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
