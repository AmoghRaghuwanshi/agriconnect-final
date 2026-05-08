'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Uncaught error:', error);
  }, [error]);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px', padding: '2rem' }}>
        <div style={{
          width: '6rem', height: '6rem', borderRadius: '50%',
          background: 'linear-gradient(135deg, #FEE2E2, #FECACA)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '3rem', margin: '0 auto 2rem',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>
          ⚠️
        </div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Something went wrong
        </h1>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem', fontSize: '0.95rem' }}>
          An unexpected error occurred. You can try again or go back to the homepage.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={reset} className="btn btn-primary">🔄 Try Again</button>
          <a href="/" className="btn btn-outline">🏠 Go Home</a>
        </div>
      </div>
    </main>
  );
}
