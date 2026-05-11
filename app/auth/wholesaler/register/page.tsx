'use client';

import Link from 'next/link';
import { useState } from 'react';
import { INDIAN_STATES } from '@/lib/constants/states';

export default function WholesalerRegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    businessName: '', gstNumber: '', contactName: '', email: '', phone: '', state: '', city: '', password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const update = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      setLoading(false);
      setError('Registration coming soon. Use Demo Login on the sign-in page.');
    }, 800);
  };

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#EFF6FF 0%,var(--bg-base) 50%)', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', height: '4rem', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.3rem', color: 'var(--green-900)' }}>🌾 AgriConnect</Link>
          <Link href="/auth/wholesaler" className="btn btn-ghost btn-sm">← Back to Login</Link>
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ width: '100%', maxWidth: '520px' }}>
          {/* Steps indicator */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
            {[1, 2].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: step >= s ? 'var(--wholesaler-primary)' : 'var(--border)', color: step >= s ? '#fff' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700 }}>{s}</div>
                {s < 2 && <div style={{ width: '3rem', height: '2px', background: step > s ? 'var(--wholesaler-primary)' : 'var(--border)' }} />}
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: '2.5rem' }}>
            <div style={{ marginBottom: '2rem' }}>
              <span className="badge badge-blue" style={{ marginBottom: '0.75rem' }}>Step {step} of 2</span>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{step === 1 ? 'Business Details' : 'Account Setup'}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {step === 1 ? 'Tell us about your wholesale business' : 'Create your login credentials'}
              </p>
            </div>

            <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSubmit}>
              {step === 1 ? (
                <>
                  <div className="form-group">
                    <label className="label" htmlFor="ws-biz-name">Business / Company Name <span style={{ color: '#DC2626' }}>*</span></label>
                    <input id="ws-biz-name" className="input" placeholder="Rajdhani Agro Traders Pvt Ltd"
                      value={form.businessName} onChange={e => update('businessName', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="label" htmlFor="ws-gst">GST Number <span style={{ color: '#DC2626' }}>*</span></label>
                    <input id="ws-gst" className="input" placeholder="22AAAAA0000A1Z5" maxLength={15}
                      value={form.gstNumber} onChange={e => update('gstNumber', e.target.value.toUpperCase())} required />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="label" htmlFor="ws-state">State</label>
                      <select id="ws-state" className="input" value={form.state} onChange={e => update('state', e.target.value)} required style={{ cursor: 'pointer' }}>
                        <option value="">Select</option>
                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="ws-city">City</label>
                      <input id="ws-city" className="input" placeholder="Mumbai" value={form.city} onChange={e => update('city', e.target.value)} required />
                    </div>
                  </div>
                  <button type="submit" id="ws-step1-btn" className="btn" style={{ width: '100%', justifyContent: 'center', background: 'var(--wholesaler-primary)', color: '#fff' }}>
                    Continue →
                  </button>
                </>
              ) : (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="label" htmlFor="ws-contact">Contact Name</label>
                      <input id="ws-contact" className="input" placeholder="Rajesh Sharma"
                        value={form.contactName} onChange={e => update('contactName', e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="ws-phone">Phone</label>
                      <input id="ws-phone" className="input" placeholder="9876543210"
                        value={form.phone} onChange={e => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="label" htmlFor="ws-email2">Business Email</label>
                    <input id="ws-email2" type="email" className="input" placeholder="bulk@yourbusiness.com"
                      value={form.email} onChange={e => update('email', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="label" htmlFor="ws-pass">Password</label>
                    <input id="ws-pass" type="password" className="input" placeholder="Min 8 characters"
                      value={form.password} onChange={e => update('password', e.target.value)} required minLength={8} />
                  </div>
                  {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}><span>⚠️</span><span style={{ fontSize: '0.85rem' }}>{error}</span></div>}
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                    <button type="submit" id="ws-register-btn" className="btn" disabled={loading}
                      style={{ flex: 1, justifyContent: 'center', background: 'var(--wholesaler-primary)', color: '#fff' }}>
                      {loading ? <span className="spinner" style={{ width: '1rem', height: '1rem', borderTopColor: '#fff' }} /> : 'Register & Start KYC'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
