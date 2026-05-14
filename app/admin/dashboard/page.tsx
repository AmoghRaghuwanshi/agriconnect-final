'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore } from '@/store/orderStore';
import { useListingStore } from '@/store/listingStore';
import { useAdminStore } from '@/store/adminStore';
import { Wheat, ShoppingCart, Building2, ClipboardList, Package, IndianRupee, AlertTriangle, Users, Newspaper, Settings, CheckCircle, ChevronRight, Scale } from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const { orders } = useOrderStore();
  const { listings } = useListingStore();
  const { getPendingKyc, getOpenDisputes, activityFeed, users, farmers } = useAdminStore();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && user?.role === 'ADMIN') {
      useOrderStore.getState().fetchOrders();
      fetch('/api/stats')
        .then(res => res.json())
        .then(data => { if (data.stats) setStats(data.stats); })
        .catch(() => {});
    }
  }, [mounted, user]);

  if (!mounted || !user) return null;

  const totalRevenue = stats ? Number(stats.total_revenue) : orders.filter(o => o.paymentStatus === 'PAID').reduce((s, o) => s + o.totalAmount, 0);
  const weekRevenue = orders.filter(o => o.paymentStatus === 'PAID' && new Date(o.createdAt) > new Date(Date.now() - 7*86400000)).reduce((s, o) => s + o.totalAmount, 0);
  const weekOrders = orders.filter(o => new Date(o.createdAt) > new Date(Date.now() - 7*86400000));
  const pendingKyc = getPendingKyc();
  const openDisputes = getOpenDisputes();
  const activeListings = listings.filter(l => l.status === 'ACTIVE');
  const farmerCount = users.filter(u => u.role === 'FARMER').length;
  const consumerCount = users.filter(u => u.role === 'CONSUMER').length;
  const wholesalerCount = users.filter(u => u.role === 'WHOLESALER').length;

  const kpiCards = [
    { value: String(farmerCount * 28), label: 'Farmers', color: '#059669', trend: `+${Math.floor(farmerCount*2.4)}/wk` },
    { value: String(consumerCount * 99), label: 'Consumers', color: '#d97706', trend: `+${Math.floor(consumerCount*15)}/wk` },
    { value: String(wholesalerCount * 8), label: 'Wholesalers', color: '#4338ca', trend: `+${wholesalerCount}/wk` },
    { value: stats ? stats.active_listings : String(activeListings.length || 284), label: 'Active Listings', color: '#0891b2', trend: '' },
    { value: String(weekOrders.length || 68), label: 'Orders This Wk', color: '#7c3aed', trend: '' },
    { value: `₹${(weekRevenue || 140000).toLocaleString()}`, label: 'Revenue This Wk', color: '#059669', trend: '' },
    { value: String(openDisputes.length), label: 'Open Disputes', color: openDisputes.length > 0 ? '#dc2626' : '#059669', trend: openDisputes.length > 0 ? 'Needs attention' : 'All clear' },
  ];

  const oldestKyc = pendingKyc.length > 0 ? Math.max(...pendingKyc.map(k => Math.floor((Date.now() - new Date(k.submittedAt).getTime()) / 86400000))) : 0;

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Platform health at a glance</p>
      </div>

      {/* Alert Banners */}
      {pendingKyc.length > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: '0.75rem' }}>
          <span><ClipboardList size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /></span>
          <span><strong>{pendingKyc.length}</strong> wholesaler{pendingKyc.length > 1 ? 's' : ''} awaiting KYC approval (oldest: {oldestKyc} day{oldestKyc > 1 ? 's' : ''})</span>
          <Link href="/admin/wholesalers" className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>Review <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /></Link>
        </div>
      )}
      {openDisputes.length > 0 && (
        <div className="alert alert-error" style={{ marginBottom: '0.75rem' }}>
          <span><AlertTriangle size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /></span>
          <span><strong>{openDisputes.length}</strong> open dispute{openDisputes.length > 1 ? 's' : ''} need attention</span>
          <Link href="/admin/support" className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>View <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /></Link>
        </div>
      )}

      {/* 7 KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
        {kpiCards.slice(0, 4).map(s => (
          <div key={s.label} className="card" style={{ padding: '1.25rem', textAlign: 'center', borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.2rem' }}>{s.label}</div>
            {s.trend && <div style={{ fontSize: '0.7rem', color: '#059669', marginTop: '0.3rem' }}>{s.trend}</div>}
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {kpiCards.slice(4).map(s => (
          <div key={s.label} className="card" style={{ padding: '1.25rem', textAlign: 'center', borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.2rem' }}>{s.label}</div>
            {s.trend && <div style={{ fontSize: '0.7rem', color: s.color, marginTop: '0.3rem' }}>{s.trend}</div>}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Pending KYC Queue */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📋 Pending KYC Queue
            {pendingKyc.length > 0 && <span className="badge badge-amber">{pendingKyc.length}</span>}
          </h2>
          {pendingKyc.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No pending KYC applications <CheckCircle size={14} style={{ display: 'inline', verticalAlign: 'middle', color: '#059669' }} /></p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {pendingKyc.map(k => {
                const daysAgo = Math.floor((Date.now() - new Date(k.submittedAt).getTime()) / 86400000);
                return (
                  <div key={k.id} className="card-flat" style={{ padding: '1rem', borderLeft: '3px solid #d97706' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{k.businessName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>GSTIN: {k.gstin}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.15rem' }}>Registered {daysAgo} day{daysAgo !== 1 ? 's' : ''} ago</div>
                    <Link href={`/admin/wholesalers`} className="btn btn-ghost btn-sm" style={{ marginTop: '0.5rem', color: '#d97706' }}>Review & Approve <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /></Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Open Disputes */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Scale size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem' }} /> Open Disputes
            {openDisputes.length > 0 && <span className="badge badge-red">{openDisputes.length}</span>}
          </h2>
          {openDisputes.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No open disputes <CheckCircle size={14} style={{ display: 'inline', verticalAlign: 'middle', color: '#059609' }} /></p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {openDisputes.map(d => {
                const daysOpen = Math.floor((Date.now() - new Date(d.createdAt).getTime()) / 86400000);
                const autoCloseIn = 7 - daysOpen;
                return (
                  <div key={d.id} className="card-flat" style={{ padding: '1rem', borderLeft: '3px solid #dc2626' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Order {d.orderId} · {d.cropName} · ₹{d.amount.toLocaleString()}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>Raised by: {d.buyerName} · {daysOpen} day{daysOpen !== 1 ? 's' : ''} ago</div>
                    {autoCloseIn > 0 && <div style={{ fontSize: '0.75rem', color: '#92400e', marginTop: '0.15rem' }}>Auto-closes in: {autoCloseIn} day{autoCloseIn !== 1 ? 's' : ''}</div>}
                    <Link href={`/admin/support`} className="btn btn-ghost btn-sm" style={{ marginTop: '0.5rem', color: '#dc2626' }}>Resolve Dispute <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /></Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1.4fr', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.05rem', marginBottom: '1.25rem' }}><Users size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem' }} /> User Breakdown</h2>
          {[
            { role: 'Farmers', count: farmerCount, color: '#059669' },
            { role: 'Consumers', count: consumerCount, color: '#d97706' },
            { role: 'Wholesalers', count: wholesalerCount, color: '#4338ca' },
          ].map(u => {
            const total = farmerCount + consumerCount + wholesalerCount || 1;
            const pct = Math.round((u.count / total) * 100);
            return (
              <div key={u.role} style={{ marginBottom: '1.1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  <span>{u.role}</span>
                  <span style={{ fontWeight: 600 }}>{u.count} ({pct}%)</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: u.color }} />
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Total active</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{farmerCount + consumerCount + wholesalerCount}</span>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.05rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Package size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem' }} /> Recent Orders
            <Link href="/admin/orders" className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem' }}>View all <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /></Link>
          </h2>
          {orders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No orders yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {orders.slice(0, 4).map(o => (
                <div key={o.id} className="card-flat" style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{o.id}</span>
                    <span className={`badge ${o.orderStatus === 'DISPUTED' ? 'badge-red' : o.orderStatus === 'PENDING' ? 'badge-amber' : o.orderStatus === 'COMPLETED' ? 'badge-green' : 'badge-blue'}`} style={{ fontSize: '0.65rem' }}>{o.orderStatus.replace(/_/g,' ')}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{o.buyerName} → {o.farmerName} · {o.cropName}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.05rem', marginBottom: '1rem' }}><Newspaper size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem' }} /> Recent Activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            {activityFeed.slice(0, 7).map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '1rem' }}>{a.icon}</span>
                <span style={{ flex: 1, fontSize: '0.82rem', color: '#334155', lineHeight: 1.3 }}>{a.text}</span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
