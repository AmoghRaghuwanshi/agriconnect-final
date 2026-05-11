'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore, type OrderStatus } from '@/store/orderStore';
import DashboardNav from '@/components/shared/DashboardNav';

type Tab = 'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

const CF = "var(--font-jakarta, 'Plus Jakarta Sans'), sans-serif";

const STATUS_CONFIG: Record<OrderStatus, { bg: string; color: string; label: string }> = {
  PENDING: { bg: '#FEF3C7', color: '#92400E', label: 'Pending' },
  CONFIRMED: { bg: '#DBEAFE', color: '#1E40AF', label: 'Confirmed' },
  OUT_FOR_DELIVERY: { bg: '#EDE9FE', color: '#5B21B6', label: 'In Transit' },
  DELIVERED: { bg: '#D1FAE5', color: '#065F46', label: 'Delivered' },
  COMPLETED: { bg: '#F3F4F6', color: '#374151', label: 'Completed' },
  CANCELLED: { bg: '#FEE2E2', color: '#991B1B', label: 'Cancelled' },
  DISPUTED: { bg: '#FEE2E2', color: '#991B1B', label: 'Disputed' },
};

function getCropEmoji(cropName: string): string {
  const l = cropName.toLowerCase();
  if (l.includes('wheat')) return '🌾';
  if (l.includes('rice')) return '🍚';
  if (l.includes('tomato')) return '🍅';
  if (l.includes('onion')) return '🧅';
  if (l.includes('potato')) return '🥔';
  if (l.includes('chili')) return '🌶️';
  if (l.includes('maize')) return '🌽';
  return '🌿';
}

/* Progress stepper steps */
const STEPS: { key: string; label: string }[] = [
  { key: 'PENDING', label: 'Ordered' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'OUT_FOR_DELIVERY', label: 'Shipped' },
  { key: 'DELIVERED', label: 'Delivered' },
];

function MiniStepper({ status }: { status: OrderStatus }) {
  const idx = STEPS.findIndex(s => s.key === status);
  const activeIdx = idx === -1 ? -1 : idx;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', marginTop: '0.5rem' }}>
      {STEPS.map((step, i) => {
        const done = i <= activeIdx;
        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
            <div style={{
              width: '0.5rem', height: '0.5rem', borderRadius: '50%',
              background: done ? (i === activeIdx ? '#FF6B35' : '#059669') : '#D1D5DB',
              transition: 'background 0.2s',
            }} />
            {i < STEPS.length - 1 && (
              <div style={{ width: '1.25rem', height: '2px', background: done ? '#059669' : '#D1D5DB' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ConsumerOrdersPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { orders } = useOrderStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>('ALL');

  const fetchOrders = useOrderStore((s) => s.fetchOrders);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && !isAuthenticated) router.push('/auth/consumer');
    if (mounted && user) fetchOrders({ buyerId: user.id });
  }, [mounted, isAuthenticated, router, user, fetchOrders]);

  if (!mounted || !user) return null;

  const myOrders = orders.filter(o => o.buyerId === user.id);
  const counts = {
    ALL: myOrders.length,
    ACTIVE: myOrders.filter(o => ['PENDING', 'CONFIRMED', 'OUT_FOR_DELIVERY'].includes(o.orderStatus)).length,
    COMPLETED: myOrders.filter(o => ['DELIVERED', 'COMPLETED'].includes(o.orderStatus)).length,
    CANCELLED: myOrders.filter(o => ['CANCELLED', 'DISPUTED'].includes(o.orderStatus)).length,
  };
  const filtered = tab === 'ALL' ? myOrders :
    tab === 'ACTIVE' ? myOrders.filter(o => ['PENDING', 'CONFIRMED', 'OUT_FOR_DELIVERY'].includes(o.orderStatus)) :
    tab === 'COMPLETED' ? myOrders.filter(o => ['DELIVERED', 'COMPLETED'].includes(o.orderStatus)) :
    myOrders.filter(o => ['CANCELLED', 'DISPUTED'].includes(o.orderStatus));

  const TABS: { key: Tab; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'ACTIVE', label: 'Active' },
    { key: 'COMPLETED', label: 'Delivered' },
    { key: 'CANCELLED', label: 'Cancelled' },
  ];

  return (
    <main style={{ minHeight: '100vh', background: '#FAFAF8' }}>
      <DashboardNav />
      <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: CF, fontSize: '1.5rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '0.25rem' }}>My Orders</h1>
        <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '1.5rem' }}>Track and manage your produce orders</p>

        {/* Pill tabs with counts */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.5rem 1rem', borderRadius: '9999px', border: 'none',
                fontFamily: CF, fontWeight: tab === t.key ? 600 : 400,
                fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap',
                background: tab === t.key ? '#1B4332' : '#F3F4F6',
                color: tab === t.key ? '#fff' : '#6B7280',
                transition: 'all 0.15s',
              }}>
              {t.label}
              {counts[t.key] > 0 && (
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700, padding: '0.1rem 0.4rem',
                  borderRadius: '9999px', minWidth: '1.1rem', textAlign: 'center',
                  background: tab === t.key ? 'rgba(255,255,255,0.2)' : '#E5E7EB',
                  color: tab === t.key ? '#fff' : '#374151',
                }}>{counts[t.key]}</span>
              )}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '4rem 2rem', textAlign: 'center', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '5rem', height: '5rem', borderRadius: '50%', background: '#F0F4F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>📦</div>
            <h2 style={{ fontFamily: CF, fontWeight: 700, fontSize: '1.1rem', color: '#1A1A1A' }}>No orders found</h2>
            <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Browse the marketplace to place your first order!</p>
            <Link href="/marketplace" className="btn" style={{ background: '#FF6B35', color: '#fff', borderRadius: '9999px', padding: '0.65rem 1.5rem', fontWeight: 600, marginTop: '0.5rem' }}>Shop Now</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map(o => {
              const sc = STATUS_CONFIG[o.orderStatus];
              const isActive = ['PENDING', 'CONFIRMED', 'OUT_FOR_DELIVERY'].includes(o.orderStatus);
              return (
                <Link key={o.id} href={`/orders/${o.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{
                    background: '#fff', borderRadius: '16px', padding: '1.25rem',
                    border: '1px solid rgba(229,231,235,0.5)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    cursor: 'pointer', transition: 'all 0.2s', display: 'flex', gap: '1rem', alignItems: 'center',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none'; }}>
                    {/* Crop icon */}
                    <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '12px', background: '#F0F4F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                      {getCropEmoji(o.cropName)}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontFamily: CF, fontWeight: 600, fontSize: '0.9rem', color: '#1A1A1A' }}>{o.cropName}</span>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '9999px', background: sc.bg, color: sc.color }}>{sc.label}</span>
                        </div>
                        <span style={{ fontFamily: CF, fontWeight: 700, fontSize: '1rem', color: '#2D6A4F' }}>₹{o.totalAmount.toLocaleString()}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                        {o.quantityKg} kg from {o.farmName} · {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                      {isActive && <MiniStepper status={o.orderStatus} />}
                    </div>

                    {/* Action hint */}
                    <div style={{ flexShrink: 0 }}>
                      {isActive ? (
                        <span style={{ fontSize: '0.75rem', color: '#FF6B35', fontWeight: 600 }}>Track →</span>
                      ) : o.orderStatus === 'DELIVERED' || o.orderStatus === 'COMPLETED' ? (
                        <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 500 }}>Reorder →</span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
