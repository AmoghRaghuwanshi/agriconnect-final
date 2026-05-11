'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore } from '@/store/orderStore';
import { useListingStore } from '@/store/listingStore';
import DashboardNav from '@/components/shared/DashboardNav';

export default function AdminAnalyticsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { orders } = useOrderStore();
  const { listings } = useListingStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'ADMIN')) {
      router.push('/auth/admin');
      return;
    }
    if (mounted && isAuthenticated && user?.role === 'ADMIN') {
      useOrderStore.getState().fetchOrders();
      useListingStore.getState().fetchListings();
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !user) return null;

  const totalRevenue = orders.filter(o => o.paymentStatus === 'PAID').reduce((s, o) => s + o.totalAmount, 0);
  const b2cOrders = orders.filter(o => o.orderType === 'B2C');
  const b2bOrders = orders.filter(o => o.orderType === 'B2B');

  // Top crops
  const cropMap: Record<string, { count: number; revenue: number }> = {};
  orders.forEach(o => {
    const key = o.cropName.split(' (')[0];
    if (!cropMap[key]) cropMap[key] = { count: 0, revenue: 0 };
    cropMap[key].count++;
    cropMap[key].revenue += o.totalAmount;
  });
  const topCrops = Object.entries(cropMap).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5);
  const maxCropRev = Math.max(...topCrops.map(c => c[1].revenue), 1);

  // Top farmers
  const farmerMap: Record<string, { name: string; orders: number; revenue: number }> = {};
  orders.forEach(o => {
    if (!farmerMap[o.farmerId]) farmerMap[o.farmerId] = { name: o.farmerName, orders: 0, revenue: 0 };
    farmerMap[o.farmerId].orders++;
    farmerMap[o.farmerId].revenue += o.totalAmount;
  });
  const topFarmers = Object.values(farmerMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <DashboardNav />
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem' }}>📈 Analytics</h1>

        {/* KPIs */}
        <div className="bento bento-4" style={{ marginBottom: '2rem' }}>
          {[
            { value: `₹${totalRevenue.toLocaleString()}`, label: 'Total Revenue', icon: '💰' },
            { value: String(orders.length), label: 'Total Orders', icon: '📦' },
            { value: String(listings.filter(l => l.status === 'ACTIVE').length), label: 'Active Listings', icon: '📋' },
            { value: `${b2bOrders.length} / ${b2cOrders.length}`, label: 'B2B / B2C Split', icon: '📊' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{s.icon}</div>
              <div className="stat-value" style={{ fontSize: '1.25rem' }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Top Crops Chart */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.5rem' }}>Top Crops by Revenue</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {topCrops.map(([name, data]) => (
                <div key={name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600 }}>{name}</span>
                    <span>₹{data.revenue.toLocaleString()} ({data.count} orders)</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${(data.revenue / maxCropRev) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Farmers */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.5rem' }}>Top Farmers by Revenue</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  {['Rank', 'Farmer', 'Orders', 'Revenue'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topFarmers.map((f, i) => (
                  <tr key={f.name} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.5rem 0', fontWeight: 700, color: i === 0 ? '#F59E0B' : 'var(--text-primary)' }}>#{i + 1}</td>
                    <td style={{ padding: '0.5rem 0', fontSize: '0.85rem' }}>{f.name}</td>
                    <td style={{ padding: '0.5rem 0', fontSize: '0.85rem' }}>{f.orders}</td>
                    <td style={{ padding: '0.5rem 0', fontSize: '0.85rem', fontWeight: 600, color: 'var(--green-900)' }}>₹{f.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="card" style={{ padding: '2rem', marginTop: '1.5rem' }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>Orders by Status</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {Object.entries(
              orders.reduce((acc, o) => { acc[o.orderStatus] = (acc[o.orderStatus] || 0) + 1; return acc; }, {} as Record<string, number>)
            ).map(([status, count]) => (
              <div key={status} className="card-flat" style={{ padding: '1rem', minWidth: '120px', textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '1.5rem' }}>{count}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{status.replace(/_/g, ' ')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
