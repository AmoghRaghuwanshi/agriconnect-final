'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function WholesalerSettings() {
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">⚙️ Settings</h1>
        <p className="page-subtitle">Manage your account preferences and security</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <Link href="/wholesaler/settings/security" className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', transition: 'transform 0.15s' }}>
          <div style={{ fontSize: '2rem' }}>🔒</div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Security</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Change password and 2FA</p>
          </div>
        </Link>

        <Link href="/wholesaler/settings/api-keys" className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', transition: 'transform 0.15s' }}>
          <div style={{ fontSize: '2rem' }}>🔑</div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>API Keys</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Manage API access for B2B integrations</p>
          </div>
        </Link>

        <Link href="/wholesaler/settings/notifications" className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', transition: 'transform 0.15s' }}>
          <div style={{ fontSize: '2rem' }}>🔔</div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Notifications</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Configure email and WhatsApp alerts</p>
          </div>
        </Link>

        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => setShowDelete(!showDelete)}>
          <div style={{ fontSize: '2rem' }}>⚠️</div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#dc2626' }}>Danger Zone</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Account deletion</p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      {showDelete && (
        <div className="card" style={{ padding: '2rem', border: '2px solid #fecaca', background: '#fff5f5' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#dc2626', marginBottom: '0.5rem' }}>⚠️ Delete Account</h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>
            This will permanently delete your account, all orders, credit history, and RFQ data. This action <strong>cannot be undone</strong>.
          </p>
          <p style={{ fontSize: '0.88rem', color: '#991b1b', marginBottom: '1rem' }}>
            To confirm, type <strong>DELETE</strong> in the box below:
          </p>
          <div className="form-group" style={{ margin: '0 0 1rem' }}>
            <input type="text" className="input" placeholder="Type DELETE to confirm" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
              style={{ borderColor: '#fecaca', maxWidth: '300px' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-primary" disabled={deleteConfirm !== 'DELETE'}
              style={{ background: deleteConfirm === 'DELETE' ? '#dc2626' : '#94a3b8', borderColor: deleteConfirm === 'DELETE' ? '#dc2626' : '#94a3b8' }}
              onClick={() => { alert('Account deletion request submitted. You will be logged out shortly.'); }}>
              Delete My Account
            </button>
            <button className="btn btn-ghost" onClick={() => { setShowDelete(false); setDeleteConfirm(''); }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
