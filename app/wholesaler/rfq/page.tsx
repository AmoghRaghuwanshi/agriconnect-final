'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import DashboardNav from '@/components/shared/DashboardNav';

interface RFQ {
  id: string;
  crop: string;
  qty: string;
  farmer: string;
  proposed: number;
  countered: number | null;
  status: 'OPEN' | 'COUNTERED' | 'ACCEPTED' | 'EXPIRED' | 'REJECTED';
  expires: string;
}

const INITIAL_RFQS: RFQ[] = [
  { id: 'RFQ-301', crop: 'Wheat (Lokwan)', qty: '10 MT', farmer: 'Raju Patel', proposed: 22, countered: 23, status: 'COUNTERED', expires: '10 May 2026' },
  { id: 'RFQ-298', crop: 'Basmati Rice', qty: '5 MT', farmer: 'Suresh Kumar', proposed: 50, countered: null, status: 'OPEN', expires: '12 May 2026' },
  { id: 'RFQ-295', crop: 'Onion (Red)', qty: '20 MT', farmer: 'Ramesh Patil', proposed: 15, countered: 17, status: 'ACCEPTED', expires: '15 May 2026' },
  { id: 'RFQ-292', crop: 'Potato', qty: '8 MT', farmer: 'Dilip Sahu', proposed: 10, countered: null, status: 'EXPIRED', expires: '1 May 2026' },
];

type Tab = 'ALL' | 'OPEN' | 'COUNTERED' | 'ACCEPTED' | 'EXPIRED';

export default function WholesalerRFQPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>('ALL');
  const [rfqs, setRfqs] = useState<RFQ[]>(INITIAL_RFQS);
  const [counteringId, setCounteringId] = useState<string | null>(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [toast, setToast] = useState('');
  const [showNewRfq, setShowNewRfq] = useState(false);
  const [newRfq, setNewRfq] = useState({ crop: 'Wheat (Lokwan)', qty: '', price: '', farmer: 'Raju Patel' });

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'WHOLESALER')) router.push('/auth/wholesaler');
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !user) return null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const filtered = tab === 'ALL' ? rfqs : rfqs.filter(r => r.status === tab);
  const badgeMap: Record<string, string> = { OPEN: 'badge-blue', COUNTERED: 'badge-amber', ACCEPTED: 'badge-green', EXPIRED: 'badge-gray', REJECTED: 'badge-red' };

  const handleAccept = (rfq: RFQ) => {
    setRfqs(prev => prev.map(r => r.id === rfq.id ? { ...r, status: 'ACCEPTED' as const } : r));
    showToast(`✅ Accepted ${rfq.crop} at ₹${rfq.countered}/kg`);
  };

  const handleCounter = (rfq: RFQ) => {
    const price = parseFloat(counterPrice);
    if (!price || price <= 0) { showToast('Enter a valid counter price'); return; }
    setRfqs(prev => prev.map(r => r.id === rfq.id ? { ...r, proposed: price, status: 'OPEN' as const, countered: null } : r));
    setCounteringId(null);
    setCounterPrice('');
    showToast(`📤 Counter offer ₹${price}/kg sent for ${rfq.crop}`);
  };

  const handleReject = (rfq: RFQ) => {
    setRfqs(prev => prev.map(r => r.id === rfq.id ? { ...r, status: 'REJECTED' as const } : r));
    showToast(`❌ Rejected RFQ for ${rfq.crop}`);
  };

  const handleNewRfq = () => {
    const qty = parseFloat(newRfq.qty);
    const price = parseFloat(newRfq.price);
    if (!qty || !price) { showToast('Please fill in all RFQ fields'); return; }
    const id = `RFQ-${300 + rfqs.length + 1}`;
    setRfqs(prev => [{ id, crop: newRfq.crop, qty: `${qty} MT`, farmer: newRfq.farmer, proposed: price, countered: null, status: 'OPEN' as const, expires: '20 May 2026' }, ...prev]);
    setShowNewRfq(false);
    setNewRfq({ crop: 'Wheat (Lokwan)', qty: '', price: '', farmer: 'Raju Patel' });
    showToast(`📨 New RFQ ${id} created`);
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <DashboardNav />
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>💬 RFQ (Request for Quote)</h1>
          <button className="btn" style={{ background: 'var(--wholesaler-primary, var(--green-900))', color: '#fff' }}
            onClick={() => setShowNewRfq(true)}>+ New RFQ</button>
        </div>

        {/* New RFQ Form */}
        {showNewRfq && (
          <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--green-900)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Create New RFQ</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="label">Crop</label>
                <select className="input" value={newRfq.crop} onChange={e => setNewRfq(r => ({ ...r, crop: e.target.value }))}>
                  {['Wheat (Lokwan)', 'Basmati Rice', 'Onion (Red)', 'Potato', 'Green Chili', 'Maize', 'Turmeric'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Farmer</label>
                <select className="input" value={newRfq.farmer} onChange={e => setNewRfq(r => ({ ...r, farmer: e.target.value }))}>
                  {['Raju Patel', 'Suresh Kumar', 'Ramesh Patil', 'Dilip Sahu', 'Venkat Rao'].map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Quantity (MT)</label>
                <input className="input" type="number" placeholder="e.g., 10" value={newRfq.qty} onChange={e => setNewRfq(r => ({ ...r, qty: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="label">Proposed Price (₹/kg)</label>
                <input className="input" type="number" placeholder="e.g., 25" value={newRfq.price} onChange={e => setNewRfq(r => ({ ...r, price: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary" onClick={handleNewRfq}>📨 Send RFQ</button>
              <button className="btn btn-ghost" onClick={() => setShowNewRfq(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className="tabs" style={{ marginBottom: '1.5rem' }}>
          {(['ALL', 'OPEN', 'COUNTERED', 'ACCEPTED', 'EXPIRED'] as Tab[]).map(t => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
              {t === 'COUNTERED' ? ' ⚡' : ''}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon" style={{ fontSize: '2.5rem' }}>💬</div>
              <div className="empty-state-title">No RFQs in this category</div>
            </div>
          ) : filtered.map(r => (
            <div key={r.id} className="card-flat" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 700 }}>{r.id}</span>
                  <span className={`badge ${badgeMap[r.status]}`}>{r.status === 'COUNTERED' ? '⚡ ' : ''}{r.status}</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Expires: {r.expires}</span>
              </div>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <strong>{r.crop}</strong> · {r.qty} · From {r.farmer}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Your offer: ₹{r.proposed}/kg
                {r.countered && <span style={{ color: '#B45309', fontWeight: 600 }}> → Countered: ₹{r.countered}/kg</span>}
              </div>
              {r.status === 'COUNTERED' && (
                <div style={{ marginTop: '1rem' }}>
                  {counteringId === r.id ? (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input className="input" type="number" placeholder="Your price ₹/kg" value={counterPrice}
                        onChange={e => setCounterPrice(e.target.value)} style={{ width: '140px', padding: '0.5rem' }} />
                      <button className="btn btn-primary btn-sm" onClick={() => handleCounter(r)}>Send</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setCounteringId(null); setCounterPrice(''); }}>Cancel</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-primary btn-sm" onClick={() => handleAccept(r)}>✓ Accept ₹{r.countered}/kg</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setCounteringId(r.id)}>Counter</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: '#DC2626' }} onClick={() => handleReject(r)}>Reject</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '0.75rem 1.5rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 200,
          fontWeight: 600, fontSize: '0.9rem', animation: 'fadeIn 0.3s ease',
        }}>
          {toast}
        </div>
      )}
    </main>
  );
}
