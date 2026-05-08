'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CheckoutSuccessPage() {
  const [orderIds, setOrderIds] = useState<string[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const ids = JSON.parse(sessionStorage.getItem('paid_order_ids') || '[]');
    setOrderIds(ids);
    setTimeout(() => setShow(true), 100);
  }, []);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: '500px', padding: '2rem', opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease' }}>
        <div style={{ width: '5rem', height: '5rem', borderRadius: '50%', background: 'var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 1.5rem', animation: 'pulse 2s infinite' }}>✅</div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Order Placed Successfully!</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
          {orderIds.length > 0 ? `Order${orderIds.length > 1 ? 's' : ''} ${orderIds.join(', ')} created.` : 'Your order has been placed.'}
          <br />The farmer will confirm shortly.
        </p>

        <div className="card" style={{ padding: '1.5rem', textAlign: 'left', marginBottom: '2rem' }}>
          <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>What happens next?</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { step: '1', text: 'Farmer confirms your order (usually within 1 hour)' },
              { step: '2', text: 'Farmer delivers to your address' },
              { step: '3', text: 'You confirm receipt → payment released to farmer' },
            ].map(s => (
              <div key={s.step} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '50%', background: 'var(--green-900)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>{s.step}</div>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{s.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <Link href="/orders" className="btn btn-primary">📦 Track Your Orders</Link>
          <Link href="/marketplace" className="btn btn-outline">🛒 Continue Shopping</Link>
        </div>
      </div>
    </main>
  );
}
