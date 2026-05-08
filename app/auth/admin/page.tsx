'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function AdminAuthPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      setLoading(false);
      setError('Admin login requires Supabase credentials. Add keys to .env.local.');
    }, 800);
  };

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #F5F3FF 0%, var(--bg-base) 50%)', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', height: '4rem', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.3rem', color: 'var(--green-900)' }}>🌾 AgriConnect</Link>
          <span className="badge badge-purple">Admin Portal</span>
        </div>
      </nav>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <div className="card" style={{ padding: '2.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', margin: '0 auto 1rem' }}>⚙️</div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.25rem' }}>Admin Login</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Restricted access — AgriConnect staff only</p>
            </div>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="label" htmlFor="admin-email">Admin Email</label>
                <input id="admin-email" type="email" className="input" placeholder="admin@agriconnect.app"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="admin-password">Password</label>
                <input id="admin-password" type="password" className="input" placeholder="••••••••"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              </div>
              {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}><span>⚠️</span><span style={{ fontSize: '0.85rem' }}>{error}</span></div>}
              <button id="admin-login-btn" type="submit" className="btn" disabled={loading}
                style={{ width: '100%', justifyContent: 'center', background: 'var(--admin-primary)', color: '#fff' }}>
                {loading ? <span className="spinner" style={{ width: '1rem', height: '1rem', borderTopColor: '#fff' }} /> : 'Access Admin Panel'}
              </button>
            </form>
          </div>
          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <Link href="/" style={{ color: 'var(--text-muted)' }}>← Return to Homepage</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
