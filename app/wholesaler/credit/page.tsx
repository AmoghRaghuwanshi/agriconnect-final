'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import DashboardNav from '@/components/shared/DashboardNav';

const CREDIT_ENTRIES = [
  { date: '28 Apr 2026', desc: 'Order #ORD-2038 — Basmati Rice 100kg', debit: 5500, credit: 0, balance: 44500 },
  { date: '25 Apr 2026', desc: 'Order #ORD-2026 — Maize 500kg', debit: 11000, credit: 0, balance: 50000 },
  { date: '20 Apr 2026', desc: 'Refund — Order #ORD-2018', debit: 0, credit: 2100, balance: 61000 },
  { date: '1 Apr 2026', desc: 'Initial credit granted', debit: 0, credit: 58900, balance: 58900 },
];

export default function WholesalerCreditPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'WHOLESALER')) router.push('/auth/wholesaler');
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !user) return null;

  const limit = 75000;
  const used = 30500;
  const available = limit - used;
  const pct = Math.round((available / limit) * 100);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <DashboardNav />
      <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem' }}>💳 Credit Ledger</h1>

        <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Limit</div>
              <div style={{ fontWeight: 800, fontSize: '1.5rem' }}>₹{limit.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Used</div>
              <div style={{ fontWeight: 800, fontSize: '1.5rem', color: '#DC2626' }}>₹{used.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Available</div>
              <div style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--green-900)' }}>₹{available.toLocaleString()}</div>
            </div>
          </div>
          <div className="progress-track" style={{ height: '10px' }}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{pct}% available</div>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>Transaction History</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                {['Date', 'Description', 'Debit', 'Credit', 'Balance'].map(h => (
                  <th key={h} style={{ textAlign: h === 'Debit' || h === 'Credit' || h === 'Balance' ? 'right' : 'left', padding: '0.75rem 0.5rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CREDIT_ENTRIES.map((e, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{e.date}</td>
                  <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem' }}>{e.desc}</td>
                  <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textAlign: 'right', color: e.debit > 0 ? '#DC2626' : 'var(--text-muted)' }}>{e.debit > 0 ? `₹${e.debit.toLocaleString()}` : '—'}</td>
                  <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textAlign: 'right', color: e.credit > 0 ? 'var(--green-900)' : 'var(--text-muted)' }}>{e.credit > 0 ? `₹${e.credit.toLocaleString()}` : '—'}</td>
                  <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', fontWeight: 600, textAlign: 'right' }}>₹{e.balance.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
