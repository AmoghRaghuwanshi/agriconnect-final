'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useOrderStore } from '@/store/orderStore';
import { useAuthStore } from '@/store/authStore';
import RecommendationSection from '@/components/shared/RecommendationSection';
import { useWholesalerRecommendations } from '@/hooks/useRecommendations';

export default function WholesalerOrders() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const { orders } = useOrderStore();
  const { user } = useAuthStore();

  useEffect(() => { setMounted(true); }, []);

  // Recommendations based on order history
  const recommendations = useWholesalerRecommendations(user?.id || '', 6);

  if (!mounted || !user) return null;

  // Demo orders + store orders
  const demoOrders = [
    { id: 'ORD-B2B-001', orderType: 'B2B', cropName: 'Wheat (Lokwan)', quantityKg: 500, pricePerKg: 21, totalAmount: 10500, orderStatus: 'CONFIRMED', createdAt: new Date(Date.now() - 172800000).toISOString(), farmName: 'Raju Farms', farmerState: 'MP', standingOrderId: null, paymentStatus: 'PAID_ESCROW' },
    { id: 'ORD-B2B-002', orderType: 'B2B', cropName: 'Onion (Nashik Red)', quantityKg: 200, pricePerKg: 24, totalAmount: 4800, orderStatus: 'COMPLETED', createdAt: new Date(Date.now() - 432000000).toISOString(), farmName: 'Kumar Organic Farm', farmerState: 'MH', standingOrderId: null, paymentStatus: 'SETTLED' },
    { id: 'ORD-B2B-003', orderType: 'B2B', cropName: 'Potato (Agra)', quantityKg: 1000, pricePerKg: 11.5, totalAmount: 11500, orderStatus: 'DELIVERED', createdAt: new Date(Date.now() - 86400000).toISOString(), farmName: 'H.K. Farms', farmerState: 'UP', standingOrderId: 'SO-001', paymentStatus: 'PAID' },
    { id: 'ORD-B2B-004', orderType: 'B2B', cropName: 'Wheat (Lokwan)', quantityKg: 500, pricePerKg: 21, totalAmount: 10500, orderStatus: 'PENDING', createdAt: new Date(Date.now() - 7200000).toISOString(), farmName: 'Raju Farms', farmerState: 'MP', standingOrderId: 'SO-002', paymentStatus: 'PENDING' },
    { id: 'ORD-B2B-005', orderType: 'B2B', cropName: 'Basmati Rice', quantityKg: 300, pricePerKg: 52, totalAmount: 15600, orderStatus: 'DISPUTED', createdAt: new Date(Date.now() - 259200000).toISOString(), farmName: 'Venkat Agri', farmerState: 'KA', standingOrderId: null, paymentStatus: 'PAID_ESCROW' },
  ];

  const myStoreOrders = orders.filter(o => o.buyerId === user.id).map(o => ({
    id: o.id, orderType: o.orderType || 'B2B', cropName: o.cropName, quantityKg: o.quantityKg,
    pricePerKg: o.pricePerKg, totalAmount: o.totalAmount, orderStatus: o.orderStatus,
    createdAt: o.createdAt, farmName: o.farmerName, farmerState: '', standingOrderId: null,
    paymentStatus: o.paymentStatus
  }));

  const allOrders = [...demoOrders, ...myStoreOrders.filter(o => !demoOrders.some(d => d.id === o.id))];

  const statusMap: Record<string, string[]> = {
    'All': [], 'Pending': ['PENDING'], 'Active': ['CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED'],
    'Completed': ['COMPLETED'], 'Disputed': ['DISPUTED']
  };

  const tabs = ['All', 'Pending', 'Active', 'Completed', 'Disputed'];
  const filtered = activeTab === 'All' ? allOrders : allOrders.filter(o => statusMap[activeTab]?.includes(o.orderStatus));

  const exportCSV = () => {
    const header = 'ID,Type,Crop,Qty(kg),Price/kg,Amount,Status,Farm,State,Date\n';
    const rows = filtered.map(o => `${o.id},${o.orderType},${o.cropName},${o.quantityKg},${o.pricePerKg},${o.totalAmount},${o.orderStatus},${o.farmName},${o.farmerState},${new Date(o.createdAt).toLocaleDateString()}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'wholesaler_orders.csv'; a.click();
  };

  const handleRecoPlaceOrder = (listing: { id: string; cropName: string; pricePerKg: number; minOrderKg: number }) => {
    // Navigate to browse page with the listing pre-selected
    window.location.href = `/wholesaler/browse?order=${listing.id}`;
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">📦 Orders</h1>
          <p className="page-subtitle">Track your purchases from farmers</p>
        </div>
        <button className="btn btn-outline" onClick={exportCSV}>📥 Export CSV</button>
      </div>

      {/* ── Quick Reorder & Related Supplies ─────────────────────────── */}
      {recommendations.length > 0 && (
        <div style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          background: 'linear-gradient(135deg, rgba(20,184,166,0.04) 0%, rgba(15,118,110,0.06) 100%)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid rgba(20,184,166,0.1)',
        }}>
          {recommendations.map((group) => (
            <RecommendationSection
              key={group.title}
              group={group}
              variant="wholesaler"
              onPlaceOrder={handleRecoPlaceOrder}
              onRfq={(listing) => {
                window.location.href = `/wholesaler/rfq/new?listing=${listing.id}&crop=${encodeURIComponent(listing.cropName)}&price=${listing.pricePerKg}`;
              }}
            />
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0' }}>
        {tabs.map(tab => {
          const count = tab === 'All' ? allOrders.length : allOrders.filter(o => statusMap[tab]?.includes(o.orderStatus)).length;
          return (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '0.6rem 1.25rem', border: 'none',
              background: activeTab === tab ? '#14b8a6' : 'transparent',
              color: activeTab === tab ? 'white' : '#64748b',
              borderRadius: '8px 8px 0 0', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
            }}>
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
              {['#ID', 'Crop', 'Farm', 'Qty', 'Rate', 'Amount', 'Status', 'Date', ''].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9', background: o.orderStatus === 'DISPUTED' ? '#fff5f5' : 'transparent' }}>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#334155' }}>{o.id}</div>
                  {o.standingOrderId && (
                    <span className="badge badge-blue" style={{ fontSize: '0.6rem', marginTop: '0.2rem' }}>🔄 Standing</span>
                  )}
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ fontWeight: 500 }}>{o.cropName}</div>
                  <span className="badge badge-gray" style={{ fontSize: '0.65rem' }}>{o.orderType}</span>
                </td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '0.88rem' }}>
                  <div>{o.farmName}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{o.farmerState}</div>
                </td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '0.88rem' }}>{o.quantityKg}kg</td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '0.88rem' }}>₹{o.pricePerKg}/kg</td>
                <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>₹{o.totalAmount.toLocaleString()}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span className={`badge ${
                    o.orderStatus === 'COMPLETED' ? 'badge-green' :
                    o.orderStatus === 'DELIVERED' ? 'badge-blue' :
                    o.orderStatus === 'CONFIRMED' ? 'badge-blue' :
                    o.orderStatus === 'DISPUTED' ? 'badge-red' : 'badge-gray'
                  }`}>{o.orderStatus.replace(/_/g, ' ')}</span>
                </td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#64748b' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <Link href={`/wholesaler/orders/${o.id}`} className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem' }}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state" style={{ padding: '3rem' }}>
            <div className="empty-state-icon">📦</div>
            <div className="empty-state-title">No orders in this tab</div>
            <Link href="/wholesaler/browse" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Listings</Link>
          </div>
        )}
      </div>

      <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
        {filtered.length} order{filtered.length !== 1 ? 's' : ''} shown
      </div>
    </div>
  );
}
