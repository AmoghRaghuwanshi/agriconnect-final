'use client';

import { useState, useEffect } from 'react';

export default function WholesalerCredit() {
  const [mounted, setMounted] = useState(false);

  const profile = { creditLimit: 75000, availableCredit: 44500 };

  const ledger = [
    { id: 'LGR-001', entryType: 'ORDER', amount: 10500, balanceAfter: 44500, createdAt: new Date(Date.now() - 172800000).toISOString(), description: 'Wheat (Lokwan) 500kg', orderId: 'ORD-B2B-001' },
    { id: 'LGR-002', entryType: 'REFUND', amount: 2100, balanceAfter: 55000, createdAt: new Date(Date.now() - 345600000).toISOString(), description: 'Dispute Resolution — Order #ORD-B2B-010', orderId: 'ORD-B2B-010' },
    { id: 'LGR-003', entryType: 'ORDER', amount: 4800, balanceAfter: 52900, createdAt: new Date(Date.now() - 432000000).toISOString(), description: 'Onion (Nashik Red) 200kg', orderId: 'ORD-B2B-002' },
    { id: 'LGR-004', entryType: 'ORDER', amount: 11500, balanceAfter: 57700, createdAt: new Date(Date.now() - 604800000).toISOString(), description: 'Potato (Agra) 1000kg', orderId: 'ORD-B2B-003' },
    { id: 'LGR-005', entryType: 'ORDER', amount: 15600, balanceAfter: 69200, createdAt: new Date(Date.now() - 691200000).toISOString(), description: 'Basmati Rice 300kg', orderId: 'ORD-B2B-005' },
    { id: 'LGR-006', entryType: 'CREDIT_INCREASE', amount: 25000, balanceAfter: 84800, createdAt: new Date(Date.now() - 864000000).toISOString(), description: 'Credit limit increased by Admin' },
    { id: 'LGR-007', entryType: 'INITIAL', amount: 50000, balanceAfter: 50000, createdAt: new Date(Date.now() - 2592000000).toISOString(), description: 'Initial credit granted by Admin after KYC' },
  ];

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const creditUsed = profile.creditLimit - profile.availableCredit;
  const creditPercent = Math.round((creditUsed / profile.creditLimit) * 100);

  return (
    <div style={{ maxWidth: '900px' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">💳 Credit Ledger</h1>
        <p className="page-subtitle">Track your credit usage and transaction history</p>
      </div>

      {/* Credit Overview */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #334155 100%)', color: '#fff', borderRadius: '1rem', border: 'none' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'white' }}>Total Credit Limit</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', marginTop: '0.25rem', color: 'white' }}>₹{profile.creditLimit.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'white' }}>Used</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', marginTop: '0.25rem', color: '#f87171' }}>₹{creditUsed.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'white' }}>Available</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', marginTop: '0.25rem', color: '#4ade80' }}>₹{profile.availableCredit.toLocaleString()}</div>
          </div>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.15)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ width: `${100 - creditPercent}%`, height: '100%', background: 'linear-gradient(90deg, #22C55E, #4ADE80)', borderRadius: '999px', transition: 'width 0.5s' }} />
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.8rem', opacity: 0.5, marginTop: '0.5rem', color: 'white' }}>
          {100 - creditPercent}% available
        </div>
      </div>

      {/* Ledger Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Transaction History</h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>Date</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>Description</th>
                <th style={{ textAlign: 'right', padding: '0.75rem', color: '#dc2626', fontSize: '0.85rem', fontWeight: 600 }}>Debit</th>
                <th style={{ textAlign: 'right', padding: '0.75rem', color: '#166534', fontSize: '0.85rem', fontWeight: 600 }}>Credit</th>
                <th style={{ textAlign: 'right', padding: '0.75rem', color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map(entry => {
                const isDebit = entry.entryType === 'ORDER';
                const isRefund = entry.entryType === 'REFUND';
                const isCredit = entry.entryType === 'INITIAL' || entry.entryType === 'CREDIT_INCREASE';
                return (
                  <tr key={entry.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem', fontSize: '0.88rem', whiteSpace: 'nowrap', color: '#64748b' }}>
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.88rem' }}>
                      <div>{entry.description}</div>
                      {entry.orderId && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>#{entry.orderId}</div>}
                    </td>
                    <td style={{ textAlign: 'right', padding: '0.75rem', fontWeight: isDebit ? 600 : 400, color: isDebit ? '#dc2626' : '#94a3b8' }}>
                      {isDebit ? `₹${entry.amount.toLocaleString()}` : '—'}
                    </td>
                    <td style={{ textAlign: 'right', padding: '0.75rem', fontWeight: (isRefund || isCredit) ? 600 : 400, color: isRefund ? '#2563eb' : isCredit ? '#166534' : '#94a3b8' }}>
                      {(isRefund || isCredit) ? `₹${entry.amount.toLocaleString()}` : '—'}
                    </td>
                    <td style={{ textAlign: 'right', padding: '0.75rem', fontWeight: 600, color: '#0f172a' }}>
                      ₹{entry.balanceAfter.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '6px', fontSize: '0.8rem', color: '#64748b' }}>
          <strong>Color coding:</strong>
          <span style={{ color: '#dc2626', margin: '0 0.75rem' }}>● Debit (orders)</span>
          <span style={{ color: '#166534', margin: '0 0.75rem' }}>● Credit (initial/increase)</span>
          <span style={{ color: '#2563eb', margin: '0 0.75rem' }}>● Refund (dispute)</span>
        </div>
      </div>
    </div>
  );
}
