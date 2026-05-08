'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore } from '@/store/orderStore';
import DashboardNav from '@/components/shared/DashboardNav';

export default function AdminDisputesPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { orders, updateStatus } = useOrderStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [resolving, setResolving] = useState<string | null>(null);
  const [resolution, setResolution] = useState('partial');
  const [note, setNote] = useState('');

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'ADMIN')) router.push('/auth/admin');
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !user) return null;

  const disputed = orders.filter(o => o.orderStatus === 'DISPUTED');

  const handleResolve = (id: string) => {
    updateStatus(id, 'COMPLETED');
    setResolving(null);
    setNote('');
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <DashboardNav />
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>⚖️ Disputes ({disputed.length} open)</h1>

        {disputed.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ fontSize: '3rem' }}>✅</div>
            <div className="empty-state-title">No open disputes</div>
            <div className="empty-state-text">All disputes have been resolved.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {disputed.map(o => (
              <div key={o.id} className="card" style={{ padding: '2rem', borderLeft: '4px solid #DC2626' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>⚠️ Order {o.id} · {o.cropName}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Buyer: {o.buyerName} vs Farmer: {o.farmerName}
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--green-900)' }}>₹{o.totalAmount.toLocaleString()}</span>
                </div>
                <div className="card-flat" style={{ padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Dispute Reason:</div>
                  <div style={{ fontSize: '0.9rem' }}>{o.disputeReason || 'No reason provided'}</div>
                  {o.disputeRaisedAt && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Raised: {new Date(o.disputeRaisedAt).toLocaleDateString('en-IN')}</div>}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Ordered: {o.quantityKg} kg · Received: {o.receivedKg ?? 'N/A'} kg · Price: ₹{o.pricePerKg}/kg
                </div>

                {resolving === o.id ? (
                  <div className="card-flat" style={{ padding: '1.5rem' }}>
                    <div className="form-group">
                      <label className="label">Resolution</label>
                      <select className="input" value={resolution} onChange={e => setResolution(e.target.value)}>
                        <option value="full_refund">Full Refund (₹{o.totalAmount})</option>
                        <option value="partial">Partial Refund</option>
                        <option value="reject">Reject Dispute (pay farmer)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="label">Admin Note</label>
                      <textarea className="input" rows={2} value={note} onChange={e => setNote(e.target.value)} placeholder="Resolution notes..." style={{ resize: 'vertical' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-ghost" onClick={() => setResolving(null)}>Cancel</button>
                      <button className="btn btn-primary" onClick={() => handleResolve(o.id)}>✓ Resolve</button>
                    </div>
                  </div>
                ) : (
                  <button className="btn btn-primary" onClick={() => setResolving(o.id)}>Resolve Dispute →</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
