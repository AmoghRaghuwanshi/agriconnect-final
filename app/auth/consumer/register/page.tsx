'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ConsumerRegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setError('Registration coming soon. Use Demo Login on the sign-in page.');
    }, 800);
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', height: '4rem', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.3rem', color: 'var(--green-900)' }}>🌾 AgriConnect</Link>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Consumer Registration</span>
        </div>
      </nav>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div className="card" style={{ padding: '2.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✨</div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Create your account</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fresh produce, directly from farms</p>
            </div>

            <button id="google-register-btn" className="btn btn-outline w-full"
              style={{ marginBottom: '1rem', width: '100%', justifyContent: 'center', gap: '0.75rem' }}
              onClick={() => setError('OAuth coming soon. Use Demo Login on the sign-in page.')}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Sign up with Google
            </button>
            <div className="divider">or</div>

            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="label" htmlFor="reg-name">Full Name</label>
                <input id="reg-name" type="text" className="input" placeholder="Priya Sharma"
                  value={form.name} onChange={e => update('name', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="reg-email">Email</label>
                <input id="reg-email" type="email" className="input" placeholder="priya@example.com"
                  value={form.email} onChange={e => update('email', e.target.value)} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="label" htmlFor="reg-pass">Password</label>
                  <input id="reg-pass" type="password" className="input" placeholder="Min 8 chars"
                    value={form.password} onChange={e => update('password', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="reg-confirm">Confirm</label>
                  <input id="reg-confirm" type="password" className="input" placeholder="Repeat"
                    value={form.confirm} onChange={e => update('confirm', e.target.value)} required />
                </div>
              </div>

              {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}><span>⚠️</span><span style={{ fontSize: '0.85rem' }}>{error}</span></div>}

              <button id="register-submit-btn" type="submit" className="btn btn-primary" disabled={loading}
                style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? <span className="spinner" style={{ width: '1rem', height: '1rem', borderTopColor: '#fff' }} /> : 'Create Account'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              By registering you agree to our{' '}
              <Link href="/legal/terms" style={{ color: 'var(--green-900)' }}>Terms</Link>{' '}and{' '}
              <Link href="/legal/privacy" style={{ color: 'var(--green-900)' }}>Privacy Policy</Link>
            </p>
            <p style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <Link href="/auth/consumer" style={{ color: 'var(--green-900)', fontWeight: 600 }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
