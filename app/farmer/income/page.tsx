'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore } from '@/store/orderStore';
import DashboardNav from '@/components/shared/DashboardNav';

export default function FarmerIncomePage() {
  const { user, isAuthenticated } = useAuthStore();
  const { orders } = useOrderStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'FARMER')) router.push('/auth/farmer');
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !user) return null;

  const myOrders = orders.filter(o => o.farmerId === user.id);
  const completed = myOrders.filter(o => o.orderStatus === 'COMPLETED' || o.orderStatus === 'DELIVERED');
  const totalIncome = completed.reduce((s, o) => s + o.totalAmount, 0);

  // Monthly grouping
  const months: Record<string, { orders: number; amount: number }> = {};
  completed.forEach(o => {
    const d = new Date(o.createdAt);
    const key = d.toLocaleString('en-IN', { month: 'short', year: 'numeric' });
    if (!months[key]) months[key] = { orders: 0, amount: 0 };
    months[key].orders++;
    months[key].amount += o.totalAmount;
  });
  const monthKeys = Object.keys(months);
  const maxAmount = Math.max(...Object.values(months).map(m => m.amount), 1);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <DashboardNav />
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem' }}>💰 Income</h1>

        {/* Summary cards */}
        <div className="bento bento-3" style={{ marginBottom: '2.5rem' }}>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div className="stat-value" style={{ color: 'var(--green-900)' }}>₹{totalIncome.toLocaleString()}</div>
            <div className="stat-label">Total Earned</div>
          </div>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div className="stat-value">{completed.length}</div>
            <div className="stat-label">Orders Completed</div>
          </div>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div className="stat-value">₹{completed.length > 0 ? Math.round(totalIncome / completed.length).toLocaleString() : '0'}</div>
            <div className="stat-label">Avg Order Value</div>
          </div>
        </div>

        {/* Bar chart */}
        {monthKeys.length > 0 && (
          <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.5rem' }}>Monthly Revenue</h2>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', height: '12rem' }}>
              {monthKeys.map(k => {
                const pct = (months[k].amount / maxAmount) * 100;
                return (
                  <div key={k} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--green-900)', marginBottom: '0.3rem' }}>₹{months[k].amount.toLocaleString()}</div>
                    <div style={{
                      width: '100%', maxWidth: '4rem', borderRadius: '0.5rem 0.5rem 0 0',
                      background: 'linear-gradient(180deg, var(--green-700), var(--green-900))',
                      height: `${Math.max(pct, 5)}%`, transition: 'height 0.5s ease',
                    }} />
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{k}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent transactions table */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>Recent Transactions</h2>
          {completed.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon" style={{ fontSize: '2rem' }}>💰</div>
              <div className="empty-state-title">No income yet</div>
              <div className="empty-state-text">Pehla order complete karo — income yahan dikhegi!</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem 0', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 0', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>Buyer</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 0', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>Crop</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem 0', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {completed.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem 0', fontSize: '0.85rem' }}>{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    <td style={{ padding: '0.75rem 0', fontSize: '0.85rem' }}>{o.buyerName}</td>
                    <td style={{ padding: '0.75rem 0', fontSize: '0.85rem' }}>{o.cropName} ({o.quantityKg} kg)</td>
                    <td style={{ padding: '0.75rem 0', fontSize: '0.85rem', textAlign: 'right', fontWeight: 700, color: 'var(--green-900)' }}>₹{o.totalAmount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
