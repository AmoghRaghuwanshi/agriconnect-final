'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import DashboardNav from '@/components/shared/DashboardNav';

export default function FarmerScorePage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'FARMER')) router.push('/auth/farmer');
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !user) return null;

  const scores = [
    { label: 'Quality', value: 80, weight: '30%', desc: 'Average review rating', icon: '⭐' },
    { label: 'Accuracy', value: 88, weight: '25%', desc: 'Correct quantity delivered', icon: '🎯' },
    { label: 'Punctuality', value: 90, weight: '30%', desc: 'On-time delivery %', icon: '⏰' },
    { label: 'Volume', value: 75, weight: '15%', desc: 'Orders per month', icon: '📦' },
  ];
  const overall = Math.round(scores.reduce((s, sc) => s + sc.value * parseFloat(sc.weight) / 100, 0));

  const reviews = [
    { rating: 5, comment: 'Very fresh wheat, accurate quantity', reviewer: 'Priya S.', date: '5 May' },
    { rating: 4, comment: 'Good quality but 5kg short', reviewer: 'Amit K.', date: '3 May' },
    { rating: 5, comment: 'Excellent rice, will order again', reviewer: 'Anita D.', date: '28 Apr' },
    { rating: 5, comment: 'Best onions in the region', reviewer: 'Rajesh A.', date: '25 Apr' },
    { rating: 4, comment: 'Delivery was slightly late', reviewer: 'Suresh M.', date: '20 Apr' },
  ];

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <DashboardNav />
      <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '700px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem' }}>📊 Farmer Score</h1>

        {/* Overall */}
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--green-900)', lineHeight: 1 }}>{overall}</div>
          <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>out of 100</div>
          <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '999px', marginTop: '1rem', overflow: 'hidden' }}>
            <div style={{ width: `${overall}%`, height: '100%', background: 'linear-gradient(90deg, var(--green-600), var(--green-900))', borderRadius: '999px', transition: 'width 1s ease' }} />
          </div>
        </div>

        {/* Sub-scores */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          {scores.map(sc => (
            <div key={sc.label} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 700 }}>{sc.icon} {sc.label}</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--green-900)' }}>{sc.value}</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${sc.value}%`, height: '100%', background: sc.value >= 85 ? 'var(--green-700)' : sc.value >= 70 ? 'var(--olive-600)' : '#F59E0B', borderRadius: '999px' }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{sc.desc} · Weight: {sc.weight}</div>
            </div>
          ))}
        </div>

        {/* Formula */}
        <div className="card-flat" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Score Formula</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
            Quality (30%) + Accuracy (25%) + Punctuality (30%) + Volume (15%)
          </div>
        </div>

        {/* Reviews */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>Recent Reviews</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.map((r, i) => (
              <div key={i} className="card-flat" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#F59E0B', letterSpacing: '2px' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.date}</span>
                </div>
                <div style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>"{r.comment}"</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>— {r.reviewer}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="card" style={{ padding: '1.5rem', marginTop: '1.5rem', background: 'var(--green-50)' }}>
          <div style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem' }}>💡 How to improve your score</div>
          <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 2, paddingLeft: '1.25rem' }}>
            <li>Always confirm received quantity with buyer</li>
            <li>Respond to orders within 30 minutes</li>
            <li>Use proper packaging for fragile produce</li>
            <li>Deliver within the promised window</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
