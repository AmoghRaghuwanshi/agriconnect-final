'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, DEMO_USERS } from '@/store/authStore';

export default function ConsumerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setError('Email login coming soon. Use the Demo Login button above.');
    }, 600);
  };

  const handleDemoLogin = () => {
    login(DEMO_USERS.CONSUMER);
    router.push('/profile');
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <nav style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', height: '4rem', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.3rem', color: 'var(--green-900)' }}>🌾 AgriConnect</Link>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Consumer Portal</span>
        </div>
      </nav>

      {/* Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div className="card" style={{ padding: '2.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛒</div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Welcome back</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sign in to your consumer account</p>
            </div>

            {/* Demo Login — prominent */}
            <button
              id="demo-consumer-login"
              className="btn btn-primary"
              onClick={handleDemoLogin}
              style={{ width: '100%', justifyContent: 'center', marginBottom: '1rem', padding: '0.875rem', fontSize: '0.95rem', gap: '0.75rem' }}
            >
              ⚡ Demo Login as Consumer (Priya Sharma)
            </button>

            <div className="divider">or sign in with email</div>

            {/* Google OAuth */}
            <button
              id="google-login-btn"
              className="btn btn-outline w-full"
              style={{ marginBottom: '1rem', width: '100%', justifyContent: 'center', gap: '0.75rem' }}
              onClick={() => setError('OAuth coming soon. Use Demo Login instead.')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="label" htmlFor="consumer-email">Email address</label>
                <input id="consumer-email" type="email" className="input" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="consumer-password">
                  <span>Password</span>
                  <Link href="/auth/consumer/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--green-800)', float: 'right' }}>Forgot?</Link>
                </label>
                <input id="consumer-password" type="password" className="input" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} required />
              </div>

              {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}><span>⚠️</span><span>{error}</span></div>}

              <button id="consumer-login-btn" type="submit" className="btn btn-outline" disabled={loading}
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                {loading ? <span className="spinner" style={{ width: '1rem', height: '1rem' }} /> : 'Sign In with Email'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              No account?{' '}
              <Link href="/auth/consumer/register" style={{ color: 'var(--green-900)', fontWeight: 600 }}>Create one free</Link>
            </p>
          </div>

          {/* Switch portals */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Looking for a different portal?</p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <Link href="/auth/farmer" className="btn btn-ghost btn-sm">🌾 Farmer</Link>
              <Link href="/auth/wholesaler" className="btn btn-ghost btn-sm">🏭 Wholesaler</Link>
              <Link href="/auth/admin" className="btn btn-ghost btn-sm">⚙️ Admin</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
