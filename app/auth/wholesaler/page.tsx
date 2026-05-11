'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, DEMO_USERS } from '@/store/authStore';

export default function WholesalerAuthPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const update = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const loginWithCredentials = useAuthStore((s) => s.loginWithCredentials);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await loginWithCredentials(form.email, form.password);
    setLoading(false);
    if (result.success) {
      router.push('/wholesaler/dashboard');
    } else {
      setError(result.error || 'Login failed. Check your credentials.');
    }
  };

  const handleDemoLogin = () => {
    login(DEMO_USERS.WHOLESALER);
    router.push('/wholesaler/dashboard');
  };

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #EFF6FF 0%, var(--bg-base) 50%)', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', height: '4rem', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.3rem', color: 'var(--green-900)' }}>🌾 AgriConnect</Link>
          <span className="badge badge-blue">Wholesaler Portal</span>
        </div>
      </nav>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div className="card" style={{ padding: '2.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '5rem', height: '5rem', borderRadius: '50%', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.25rem', margin: '0 auto 1rem' }}>🏭</div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Wholesaler Login</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>B2B bulk produce sourcing platform</p>
            </div>

            {/* Demo Login */}
            <button
              id="demo-wholesaler-login"
              className="btn"
              onClick={handleDemoLogin}
              style={{ width: '100%', justifyContent: 'center', marginBottom: '1.25rem', padding: '0.875rem', fontSize: '0.95rem', gap: '0.75rem', background: 'var(--wholesaler-primary)', color: '#fff' }}
            >
              ⚡ Demo Login as Wholesaler (Rajesh Agarwal)
            </button>

            <div className="divider">or sign in with email</div>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="label" htmlFor="ws-email">Business Email</label>
                <input id="ws-email" type="email" className="input" placeholder="bulk@yourbusiness.com"
                  value={form.email} onChange={e => update('email', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="ws-password">Password</label>
                <input id="ws-password" type="password" className="input" placeholder="••••••••"
                  value={form.password} onChange={e => update('password', e.target.value)} required />
              </div>
              {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}><span>⚠️</span><span style={{ fontSize: '0.85rem' }}>{error}</span></div>}
              <button id="ws-login-btn" type="submit" className="btn btn-outline" disabled={loading}
                style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? <span className="spinner" style={{ width: '1rem', height: '1rem' }} /> : 'Sign In with Email'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              New business?{' '}
              <Link href="/auth/wholesaler/register" style={{ color: 'var(--wholesaler-primary)', fontWeight: 600 }}>Register & apply for KYC</Link>
            </p>
          </div>
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <Link href="/auth/consumer" className="btn btn-ghost btn-sm">🛒 Consumer</Link>
              <Link href="/auth/farmer" className="btn btn-ghost btn-sm">🌾 Farmer</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
