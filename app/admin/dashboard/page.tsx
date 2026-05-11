'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore } from '@/store/orderStore';
import { useListingStore } from '@/store/listingStore';
import DashboardNav from '@/components/shared/DashboardNav';

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { orders } = useOrderStore();
  const { listings } = useListingStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'ADMIN')) router.push('/auth/admin');
    
    // Fetch live DB stats
    if (mounted && isAuthenticated && user?.role === 'ADMIN') {
      fetch('/api/stats')
        .then(res => res.json())
        .then(data => { if (data.stats) setStats(data.stats); })
        .catch(console.error);
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !user) return null;

  const totalRevenue = stats ? Number(stats.total_revenue) : orders.filter(o => o.paymentStatus === 'PAID').reduce((s, o) => s + o.totalAmount, 0);
  const disputedCount = stats ? Number(stats.disputed_orders) : orders.filter(o => o.orderStatus === 'DISPUTED').length;
  const pendingCount = stats ? Number(stats.pending_orders) : orders.filter(o => o.orderStatus === 'PENDING').length;

  const totalUsers = stats ? Number(stats.total_users) : 1247;
  const farmerCount = stats ? Number(stats.total_farmers) : 842;
  const consumerCount = stats ? Number(stats.total_consumers) : 356;
  const wholesalerCount = stats ? Number(stats.total_wholesalers) : 49;

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <DashboardNav />
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Admin Panel ⚙️</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Platform health at a glance (Live from Neon DB)</p>

        {/* Alert banners */}
        {disputedCount > 0 && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
            <span>⚠️</span>
            <span>{disputedCount} dispute{disputedCount > 1 ? 's' : ''} need attention</span>
            <Link href="/admin/disputes" className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>View →</Link>
          </div>
        )}
        {pendingCount > 0 && (
          <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
            <span>⏳</span>
            <span>{pendingCount} order{pendingCount > 1 ? 's' : ''} awaiting farmer confirmation</span>
          </div>
        )}

        <div className="bento bento-4" style={{ marginBottom: '2rem' }}>
          {[
            { value: totalUsers.toLocaleString(), label: 'Total Users', icon: '👥', href: '/admin/users' },
            { value: stats ? stats.active_listings : String(listings.filter(l => l.status === 'ACTIVE').length), label: 'Active Listings', icon: '📋', href: '/admin/orders' },
            { value: stats ? stats.total_orders : String(orders.length), label: 'Total Orders', icon: '📦', href: '/admin/orders' },
            { value: `₹${totalRevenue.toLocaleString()}`, label: 'Total Revenue', icon: '💰', href: '/admin/analytics' },
          ].map(s => (
            <Link key={s.label} href={s.href} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="stat-card" style={{ textAlign: 'center', cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s' }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{s.icon}</div>
                <div className="stat-value" style={{ fontSize: '1.5rem' }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick links */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          <Link href="/admin/users" className="btn btn-outline">👥 Users</Link>
          <Link href="/admin/orders" className="btn btn-outline">📦 Orders</Link>
          <Link href="/admin/disputes" className="btn btn-outline">⚖️ Disputes</Link>
          <Link href="/admin/analytics" className="btn btn-outline">📈 Analytics</Link>
        </div>

        <div className="bento bento-2" style={{ gap: '1.5rem' }}>
          {/* User breakdown */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.15rem', marginBottom: '1rem' }}>User Breakdown</h2>
            {[
              { role: '🌾 Farmers', count: farmerCount, pct: totalUsers > 0 ? Math.round((farmerCount / totalUsers) * 100) : 0 },
              { role: '🛒 Consumers', count: consumerCount, pct: totalUsers > 0 ? Math.round((consumerCount / totalUsers) * 100) : 0 },
              { role: '🏭 Wholesalers', count: wholesalerCount, pct: totalUsers > 0 ? Math.round((wholesalerCount / totalUsers) * 100) : 0 },
            ].map(u => (
              <div key={u.role} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.3rem' }}>
                  <span>{u.role}</span><span style={{ fontWeight: 600 }}>{u.count} ({u.pct}%)</span>
                </div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${u.pct}%` }} /></div>
              </div>
            ))}
          </div>

          {/* Recent orders */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.15rem', marginBottom: '1rem' }}>Recent Orders</h2>
            {orders.slice(0, 4).map(o => (
              <div key={o.id} className="card-flat" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{o.id}</span>
                  <span className={`badge ${o.orderStatus === 'DISPUTED' ? 'badge-red' : o.orderStatus === 'PENDING' ? 'badge-amber' : 'badge-green'}`}>{o.orderStatus.replace(/_/g, ' ')}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{o.buyerName} → {o.farmerName} · {o.cropName}</div>
              </div>
            ))}
            <Link href="/admin/orders" className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}>View All →</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
