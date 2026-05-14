'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function KycPending() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => { setMounted(true); }, []);

  // Animate "checking…" dots
  useEffect(() => {
    const iv = setInterval(() => setDotCount(d => (d % 3) + 1), 800);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated || user?.role !== 'WHOLESALER') {
      router.push('/auth/wholesaler');
    }
    // In a real app this would poll Supabase. For demo, the wholesaler demo user
    // is always "verified" so the layout normally gates them. This page shows for
    // any wholesaler whose account hasn't been verified yet.
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted) return null;

  const gstin = '23AABCU9603R1ZX';
  const email = user?.email ?? 'you@company.com';

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
      padding: '1rem',
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '480px', textAlign: 'center', padding: '3rem 2.5rem' }}>
        {/* Pulsing icon */}
        <div style={{
          fontSize: '3.5rem',
          marginBottom: '1.25rem',
          animation: 'pulse 2s ease-in-out infinite',
        }}>⏳</div>

        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          Account Under Review
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
          We&#39;re verifying your business details
        </p>

        {/* Progress steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem', textAlign: 'left' }}>
          {[
            { icon: '✓', label: 'Business details submitted', bg: '#dcfce7', color: '#166534', done: true },
            { icon: '⏳', label: 'Admin review in progress', bg: '#fef3c7', color: '#92400e', done: false },
            { icon: '○', label: 'Account activation', bg: '#f8fafc', color: '#64748b', done: false },
          ].map((step) => (
            <div key={step.label} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 1rem',
              background: step.bg,
              borderRadius: '8px',
              fontSize: '0.875rem',
              color: step.color,
            }}>
              <span style={{ fontWeight: 700, fontSize: '1rem', minWidth: '1.2rem', textAlign: 'center' }}>{step.icon}</span>
              <span style={{ fontWeight: step.done ? 600 : 500 }}>{step.label}</span>
            </div>
          ))}
        </div>

        {/* Info box */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem',
          textAlign: 'left',
          fontSize: '0.875rem',
          color: '#475569',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
        }}>
          <div><strong>GSTIN:</strong> {gstin}</div>
          <div><strong>Email:</strong> {email}</div>
        </div>

        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
          This typically takes <strong>1–2 business days</strong>.<br />
          We&apos;ll email you at <strong>{email}</strong> when approved.
        </p>

        {/* Polling indicator */}
        <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '1.5rem' }}>
          Auto-checking for approval{'.'.repeat(dotCount)}
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/marketplace" className="btn btn-outline" style={{
            background: 'white', color: '#14b8a6', border: '1px solid #14b8a6',
          }}>
            Browse Marketplace (Read-only)
          </Link>
          <a href="mailto:support@agriconnect.app" className="btn btn-outline" style={{
            background: 'white', color: '#14b8a6', border: '1px solid #14b8a6',
          }}>
            Contact Support
          </a>
        </div>
      </div>
    </main>
  );
}
