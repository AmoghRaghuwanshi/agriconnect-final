'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function FarmerAuthPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) { setError('Please enter a valid 10-digit mobile number.'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setError('OTP service requires Supabase + Fast2SMS keys in .env.local.');
    }, 800);
  };

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, var(--green-50) 0%, var(--bg-base) 50%)', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', height: '4rem', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.3rem', color: 'var(--green-900)' }}>🌾 AgriConnect</Link>
          <span className="badge badge-green">Farmer Portal</span>
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <div style={{ width: '5rem', height: '5rem', borderRadius: '50%', background: 'var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.25rem', margin: '0 auto 1.5rem' }}>
              🌾
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Farmer Login</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Enter your mobile number. We&apos;ll send an OTP via WhatsApp.
            </p>

            <form onSubmit={handleSendOTP}>
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="label" htmlFor="farmer-phone">Mobile Number</label>
                <div className="input-group">
                  <span className="input-group-icon" style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>+91</span>
                  <input
                    id="farmer-phone"
                    type="tel"
                    className="input"
                    placeholder="9876543210"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                    style={{ paddingLeft: '3rem' }}
                    required
                  />
                </div>
              </div>

              {error && <div className="alert alert-error" style={{ marginBottom: '1rem', textAlign: 'left' }}><span>⚠️</span><span style={{ fontSize: '0.85rem' }}>{error}</span></div>}

              <button id="farmer-send-otp-btn" type="submit" className="btn btn-primary" disabled={loading}
                style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? <span className="spinner" style={{ width: '1rem', height: '1rem', borderTopColor: '#fff' }} /> : '📱 Send OTP via WhatsApp'}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--green-50)', borderRadius: 'var(--radius-md)', textAlign: 'left' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--green-900)', fontWeight: 600, marginBottom: '0.25rem' }}>🎤 Hindi Voice Support</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Once logged in, you can list produce using your voice in Hindi.</p>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Looking for a different portal?</p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <Link href="/auth/consumer" className="btn btn-ghost btn-sm">🛒 Consumer</Link>
              <Link href="/auth/wholesaler" className="btn btn-ghost btn-sm">🏭 Wholesaler</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
