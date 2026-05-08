'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import DashboardNav from '@/components/shared/DashboardNav';

function getCropEmoji(cropName: string): string {
  const lower = cropName.toLowerCase();
  if (lower.includes('wheat')) return '🌾';
  if (lower.includes('rice') || lower.includes('basmati')) return '🍚';
  if (lower.includes('tomato')) return '🍅';
  if (lower.includes('onion')) return '🧅';
  if (lower.includes('potato')) return '🥔';
  if (lower.includes('chili') || lower.includes('mirch')) return '🌶️';
  if (lower.includes('maize') || lower.includes('corn')) return '🌽';
  if (lower.includes('turmeric')) return '🟡';
  return '🌿';
}

export default function CartPage() {
  const { isAuthenticated } = useAuthStore();
  const { items, updateQuantity, removeItem, total } = useCartStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const subtotal = total();

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {isAuthenticated ? <DashboardNav /> : (
        <nav style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', height: '4rem', display: 'flex', alignItems: 'center' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.3rem', color: 'var(--green-900)' }}>🌾 AgriConnect</Link>
            <Link href="/auth/consumer" className="btn btn-primary btn-sm">Sign In</Link>
          </div>
        </nav>
      )}

      <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>🛒 Your Cart ({items.length} item{items.length !== 1 ? 's' : ''})</h1>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Cart is empty</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Browse the marketplace to add fresh produce.</div>
            <Link href="/marketplace" className="btn btn-primary" style={{ marginTop: '1rem' }}>Shop Now</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
            <div>
              {items.map(item => (
                <div key={item.listing_id} className="card-flat" style={{ padding: '1.25rem', marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '4rem', height: '4rem', borderRadius: 'var(--radius-md)', background: 'var(--green-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>
                    {getCropEmoji(item.crop_name)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{item.crop_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>👨‍🌾 {item.farmer_name} · ₹{item.price_per_kg}/kg</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button className="btn btn-ghost btn-sm"
                      onClick={() => updateQuantity(item.listing_id, Math.max(item.min_order_kg ?? 1, item.quantity_kg - (item.min_order_kg ?? 1)))}
                    >−</button>
                    <span style={{ fontWeight: 700, minWidth: '2.5rem', textAlign: 'center' }}>{item.quantity_kg} kg</span>
                    <button className="btn btn-ghost btn-sm"
                      onClick={() => updateQuantity(item.listing_id, item.quantity_kg + (item.min_order_kg ?? 1))}
                    >+</button>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '5rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--green-900)' }}>₹{(item.price_per_kg * item.quantity_kg).toLocaleString()}</div>
                    <button onClick={() => removeItem(item.listing_id)} style={{ fontSize: '0.75rem', color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.25rem' }}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: '2rem', alignSelf: 'flex-start', position: 'sticky', top: '5rem' }}>
              <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>Order Summary</h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
                <span style={{ fontWeight: 600 }}>₹{subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Delivery</span>
                <span style={{ fontWeight: 600, color: 'var(--green-900)' }}>FREE</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700 }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--green-900)' }}>₹{subtotal.toLocaleString()}</span>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}
                onClick={() => {
                  if (!isAuthenticated) { router.push('/auth/consumer'); return; }
                  router.push('/checkout');
                }}>
                Proceed to Checkout
              </button>
              <Link href="/marketplace" className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                ← Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
