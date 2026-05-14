'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore } from '@/store/orderStore';
import { useRFQStore } from '@/store/rfqStore';
import { useStandingOrderStore } from '@/store/standingOrderStore';

export default function WholesalerDashboardPage() {
  const { user } = useAuthStore();
  const { orders } = useOrderStore();
  const { rfqs } = useRFQStore();
  const { orders: standingOrders } = useStandingOrderStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted || !user) return null;

  const myOrders = orders.filter(o => o.buyerId === user.id);
  const totalSpent = myOrders.filter(o => o.paymentStatus === 'PAID').reduce((s, o) => s + o.totalAmount, 0);
  const myRfqs = rfqs.filter((r: any) => r.wholesalerId === user.id);
  const pendingRfqs = myRfqs.filter((r: any) => r.status === 'PENDING' || r.status === 'COUNTERED');
  const myStanding = standingOrders.filter((o: any) => o.wholesalerId === user.id);
  const activeStanding = myStanding.filter((o: any) => o.status === 'ACTIVE');
  const creditLimit = 75000;
  const available = creditLimit - 30500;

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          Welcome, {user.businessName || user.name} 🏭
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>B2B Marketplace Dashboard</p>
      </div>

      {/* Credit Card */}
      <Link href="/wholesaler/credit" style={{ textDecoration: 'none', color: 'white' }}>
        <div className="card" style={{
          padding: '2rem',
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #334155 100%)',
          color: '#fff',
          cursor: 'pointer',
          transition: 'transform 0.15s, box-shadow 0.15s',
          borderRadius: '1rem',
          border: 'none',
        }}
          onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.transform = 'scale(1.01)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'; }}
          onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.75rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem', color: 'white' }}>💳 Available Credit</div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'white' }}>
                ₹{available.toLocaleString()}
                <span style={{ fontSize: '0.9rem', opacity: 0.4, fontWeight: 400, color: 'white' }}> / ₹{creditLimit.toLocaleString()}</span>
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.4, color: 'white' }}>View Ledger →</div>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.15)', borderRadius: '999px', marginTop: '1rem', overflow: 'hidden' }}>
            <div style={{ width: `${Math.round((available / creditLimit) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #22C55E, #4ADE80)', borderRadius: '999px' }} />
          </div>
        </div>
      </Link>

      {/* Stats */}
      <div className="bento bento-4" style={{ marginBottom: '2rem' }}>
        {[
          { value: String(myOrders.length), label: 'Total Orders', color: '#1a2e5a' },
          { value: String(pendingRfqs.length), label: 'Pending RFQs', color: '#3b82f6' },
          { value: String(activeStanding.length), label: 'Standing Orders', color: '#059669' },
          { value: myOrders[0]?.cropName?.split(' ')[0] ?? '—', label: 'Top Crop', color: '#d97706' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '1.5rem', textAlign: 'center', borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.3rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <Link href="/wholesaler/browse" className="btn btn-primary">🔍 Browse Farmers</Link>
        <Link href="/wholesaler/rfq" className="btn btn-outline">💬 New RFQ</Link>
        <Link href="/wholesaler/standing-orders" className="btn btn-outline">🔄 New Standing Order</Link>
      </div>

      {/* Pending RFQs (action needed) */}
      {pendingRfqs.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            💬 Pending RFQs — Action Needed
            <span className="badge badge-amber">{pendingRfqs.length}</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingRfqs.slice(0, 3).map((r: any) => (
              <div key={r.id} className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #d97706' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {r.status === 'COUNTERED' ? '⚡' : '💬'} {r.farmerName} {r.status === 'COUNTERED' ? 'countered your RFQ' : '— awaiting response'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                      {r.cropName} · {r.currentQuantityKg}kg · Proposed: ₹{r.currentPricePerKg}/kg
                    </div>
                  </div>
                  <Link href={`/wholesaler/rfq/${r.id}`} className="btn btn-outline btn-sm" style={{ color: '#d97706', borderColor: '#d97706' }}>
                    View & Reply →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.15rem', marginBottom: '1.25rem' }}>Recent Orders</h2>
        {myOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ fontSize: '2rem' }}>📦</div>
            <div className="empty-state-title">No orders yet</div>
            <Link href="/wholesaler/browse" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>Browse Listings</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {myOrders.slice(0, 4).map(o => (
              <div key={o.id} className="card-flat" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{o.id} · {o.cropName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{o.farmerName} · {o.quantityKg} kg</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--green-900)' }}>₹{o.totalAmount.toLocaleString()}</div>
                  <span className={`badge ${o.orderStatus === 'COMPLETED' ? 'badge-green' : o.orderStatus === 'PENDING' ? 'badge-amber' : 'badge-blue'}`}>{o.orderStatus.replace(/_/g, ' ')}</span>
                </div>
              </div>
            ))}
            <Link href="/wholesaler/orders" className="btn btn-ghost btn-sm" style={{ alignSelf: 'center' }}>View All Orders →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
