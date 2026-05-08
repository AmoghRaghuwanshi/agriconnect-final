'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore } from '@/store/orderStore';
import { useCartStore } from '@/store/cartStore';
import DashboardNav from '@/components/shared/DashboardNav';

export default function PaymentPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { markPaid } = useOrderStore();
  const { clearCart } = useCartStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [method, setMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [failed, setFailed] = useState(false);
  const [orderIds, setOrderIds] = useState<string[]>([]);
  const [checkoutTotal, setCheckoutTotal] = useState(0);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && !isAuthenticated) router.push('/auth/consumer');
  }, [mounted, isAuthenticated, router]);

  // Hydrate order IDs from sessionStorage
  useEffect(() => {
    if (mounted) {
      const ids = JSON.parse(sessionStorage.getItem('checkout_order_ids') || '[]');
      const total = parseFloat(sessionStorage.getItem('checkout_total') || '0');
      if (ids.length === 0) {
        router.push('/marketplace');
        return;
      }
      setOrderIds(ids);
      setCheckoutTotal(total);
    }
  }, [mounted, router]);

  if (!mounted || !user) return null;

  const handlePay = () => {
    setProcessing(true);
    setFailed(false);
    setTimeout(() => {
      orderIds.forEach(id => markPaid(id, method === 'upi' ? 'UPI' : method === 'card' ? 'Card' : 'Net Banking'));
      // NOW clear the cart — only after payment succeeds
      clearCart();
      sessionStorage.setItem('paid_order_ids', JSON.stringify(orderIds));
      sessionStorage.removeItem('checkout_order_ids');
      sessionStorage.removeItem('checkout_total');
      router.push('/checkout/success');
    }, 2000);
  };

  const handleRetry = () => {
    setFailed(false);
    setProcessing(false);
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <DashboardNav />
      <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '500px', margin: '0 auto' }}>
        {processing ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div className="spinner" style={{ width: '3rem', height: '3rem', margin: '0 auto 1.5rem' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Processing Payment...</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Please wait, do not close this page.</p>
          </div>
        ) : failed ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem' }}>❌</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#DC2626' }}>Payment Failed</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>Something went wrong. Please try again.</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={handleRetry}>🔄 Try Again</button>
              <Link href="/cart" className="btn btn-ghost">← Back to Cart</Link>
            </div>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>💳 Payment</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Choose your payment method</p>
            {checkoutTotal > 0 && (
              <div style={{ padding: '0.75rem 1rem', background: 'var(--green-50)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Amount to pay</span>
                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--green-900)' }}>₹{checkoutTotal.toLocaleString()}</span>
              </div>
            )}

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                {[
                  { id: 'upi', label: '📱 UPI (GPay / PhonePe / Paytm)', desc: 'Instant payment via UPI' },
                  { id: 'card', label: '💳 Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
                  { id: 'netbanking', label: '🏦 Net Banking', desc: 'All major banks' },
                ].map(m => (
                  <label key={m.id} className="card-flat" style={{
                    padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem',
                    border: method === m.id ? '2px solid var(--green-900)' : '2px solid transparent',
                  }}>
                    <input type="radio" name="method" checked={method === m.id} onChange={() => setMethod(m.id)}
                      style={{ width: '1.1rem', height: '1.1rem', accentColor: 'var(--green-900)' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.label}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              {method === 'upi' && (
                <div className="form-group">
                  <label className="label">UPI ID</label>
                  <input className="input" placeholder="yourname@upi" value={upiId} onChange={e => setUpiId(e.target.value)} />
                </div>
              )}

              <button className="btn btn-primary" onClick={handlePay}
                style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', marginTop: '1rem', fontSize: '1rem' }}>
                Pay ₹{checkoutTotal.toLocaleString()} →
              </button>

              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🔒 Secured by AgriConnect Pay (Demo)</span>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
