'use client';

import Link from 'next/link';
import { useAdminStore } from '@/store/adminStore';
import { useState, useEffect } from 'react';
import { Scale, CheckCircle, AlertTriangle, Camera, ChevronRight } from 'lucide-react';

export default function AdminDisputesQueue() {
  const [mounted, setMounted] = useState(false);
  const { getOpenDisputes, getResolvedDisputes, resolveDispute } = useAdminStore();
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const disputes = getOpenDisputes();
  const resolved = getResolvedDisputes();
  const now = new Date();
  const autoCloseInDays = 7;

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title"><Scale size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem' }} /> Disputes Queue</h1>
        <p className="page-subtitle">Resolve order disputes between buyers and farmers</p>
      </div>

      <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        Open Disputes ({disputes.length})
        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 400 }}>— sorted oldest first (most urgent)</span>
      </h2>

      {disputes.length === 0 ? (
        <div className="empty-state" style={{ marginBottom: '2rem' }}>
          <div className="empty-state-icon" style={{ fontSize: '3rem' }}><CheckCircle size={40} style={{ color: '#10b981' }} /></div>
          <div className="empty-state-title">No open disputes — great!</div>
          <div className="empty-state-text">All platform transactions are going smoothly.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {disputes.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map(d => {
            const raisedDate = new Date(d.createdAt);
            const daysOpen = Math.floor((now.getTime() - raisedDate.getTime()) / (1000 * 60 * 60 * 24));
            const daysRemaining = autoCloseInDays - daysOpen;
            const isUrgent = daysRemaining <= 2;

            return (
              <div key={d.id} className="card" style={{ padding: '1.5rem', borderLeft: `4px solid ${isUrgent ? '#dc2626' : '#f59e0b'}` }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <AlertTriangle size={24} style={{ color: '#ef4444' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Order {d.orderId} · {d.cropName} {d.quantityKg}kg · ₹{d.amount.toLocaleString()}</h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>Buyer: {d.buyerName} · Farmer: {d.farmerName}</p>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Raised {daysOpen} day{daysOpen !== 1 ? 's' : ''} ago</div>
                    </div>
                    <div style={{ padding: '0.75rem', background: '#fef2f2', borderRadius: '6px', fontSize: '0.9rem', marginBottom: '0.75rem', color: '#991b1b' }}>
                      <strong>Reason:</strong> &quot;{d.reason}&quot;
                    </div>
                    {isUrgent && (
                      <div style={{ padding: '0.5rem 0.75rem', background: '#fef3c7', borderRadius: '6px', fontSize: '0.85rem', color: '#92400e', marginBottom: '0.75rem' }}>
                        ⏰ Auto-closes in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} — urgent attention required
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button className="btn btn-primary btn-sm" style={{ background: '#059669', borderColor: '#059669' }} onClick={() => resolveDispute(d.id, 'RESOLVED_REFUND_FULL', 'Full refund issued')}>Full Refund</button>
                      <button className="btn btn-outline btn-sm" onClick={() => resolveDispute(d.id, 'RESOLVED_REFUND_PARTIAL', 'Partial refund issued')}>Partial Refund</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: '#dc2626' }} onClick={() => resolveDispute(d.id, 'RESOLVED_REJECTED', 'Dispute rejected')}>Reject</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {resolved.length > 0 && (
        <div>
          <button className="btn btn-ghost" onClick={() => setShowResolved(!showResolved)} style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>
            {showResolved ? '▾ Hide' : '▸ Show'} Resolved Disputes ({resolved.length})
          </button>
          {showResolved && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {resolved.map(d => (
                <div key={d.id} className="card-flat" style={{ padding: '1rem', opacity: 0.7 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Order {d.orderId} · {d.cropName}</span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '0.75rem' }}>{d.buyerName} vs {d.farmerName}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className={`badge ${d.status.includes('REFUND') ? 'badge-blue' : 'badge-gray'}`} style={{ fontSize: '0.7rem' }}>{d.status.replace('RESOLVED_', '').replace(/_/g, ' ')}</span>
                      {d.resolvedAt && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(d.resolvedAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
