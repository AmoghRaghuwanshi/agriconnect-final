'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1000);
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', height: '4rem', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.3rem', color: 'var(--green-900)' }}>🌾 AgriConnect</Link>
          <Link href="/auth/consumer" className="btn btn-ghost btn-sm">← Back to Login</Link>
        </div>
      </nav>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
            {sent ? (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Check your email</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  We&apos;ve sent a password reset link to <strong>{email}</strong>
                </p>
                <Link href="/auth/consumer" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Back to Login</Link>
              </>
            ) : (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔑</div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.25rem' }}>Forgot Password?</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Enter your email to receive a reset link.</p>
                <form onSubmit={handleSubmit}>
                  <div className="form-group" style={{ textAlign: 'left' }}>
                    <label className="label" htmlFor="forgot-email">Email address</label>
                    <input id="forgot-email" type="email" className="input" placeholder="you@example.com"
                      value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <button id="send-reset-btn" type="submit" className="btn btn-primary" disabled={loading}
                    style={{ width: '100%', justifyContent: 'center' }}>
                    {loading ? <span className="spinner" style={{ width: '1rem', height: '1rem', borderTopColor: '#fff' }} /> : 'Send Reset Link'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
