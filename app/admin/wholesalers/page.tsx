'use client';

import Link from 'next/link';
import { useAdminStore } from '@/store/adminStore';
import { useState, useEffect } from 'react';
import { Clock, Building2, ChevronRight } from 'lucide-react';

export default function AdminWholesalers() {
  const [mounted, setMounted] = useState(false);
  const { getPendingKyc, approveKyc, rejectKyc } = useAdminStore();
  const pending = getPendingKyc();
  
  const verified = [
    { user_id: 'demo-wholesaler-001', business_name: 'Vikas Trading Co.', email: 'vikas@demo.agriconnect.app', gstin: '07AABCB1234M1Z5', credit_limit: 500000, available_credit: 425000, status: 'Active' }
  ];

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Wholesalers</h1>
        <p className="page-subtitle">Review KYC and manage credit limits</p>
      </div>

      {pending.length > 0 && (
        <div className="section" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span><Clock size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /></span> Pending KYC ({pending.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pending.map((wholesaler) => (
              <div key={wholesaler.id} className="card-flat" style={{ padding: '1.25rem', border: '1px solid #fcd34d', background: '#fffbeb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{wholesaler.businessName}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>Applicant: {wholesaler.applicantName}</p>
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>GSTIN: {wholesaler.gstin} · {wholesaler.state}</p>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>Submitted {new Date(wholesaler.submittedAt).toLocaleDateString()}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-primary" style={{ background: '#059669', borderColor: '#059669' }} onClick={() => approveKyc(wholesaler.id, 25000)}>Approve</button>
                    <button className="btn btn-outline" style={{ borderColor: '#dc2626', color: '#dc2626' }} onClick={() => rejectKyc(wholesaler.id)}>Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="section">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Verified Wholesalers ({verified.length})</h2>
        <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Business Name</th>
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>GSTIN</th>
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Credit Limit</th>
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Used</th>
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {verified.map((w) => (
                <tr key={w.user_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600 }}>{w.business_name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{w.email}</div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#475569' }}>{w.gstin}</td>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>₹{w.credit_limit.toLocaleString()}</td>
                  <td style={{ padding: '1rem', color: '#dc2626' }}>₹{(w.credit_limit - w.available_credit).toLocaleString()}</td>
                  <td style={{ padding: '1rem' }}><span className="badge badge-green">Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pending.length === 0 && verified.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon"><Building2 size={40} style={{ color: 'var(--text-muted)' }} /></div>
          <div className="empty-state-title">No wholesalers registered</div>
        </div>
      )}
    </div>
  );
}
