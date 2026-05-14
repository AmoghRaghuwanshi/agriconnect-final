'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * /wholesaler → redirect to /wholesaler/dashboard
 * The real dashboard lives at /wholesaler/dashboard with live store data.
 */
export default function WholesalerRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/wholesaler/dashboard');
  }, [router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem', animation: 'pulse 1.5s infinite' }}>🏭</div>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading wholesaler dashboard…</p>
      </div>
    </div>
  );
}
