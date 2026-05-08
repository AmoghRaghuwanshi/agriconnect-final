'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useListingStore } from '@/store/listingStore';
import { useCartStore, type CartItem } from '@/store/cartStore';
import DashboardNav from '@/components/shared/DashboardNav';

export default function WholesalerBrowsePage() {
  const { user, isAuthenticated } = useAuthStore();
  const { listings } = useListingStore();
  const { addItem } = useCartStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [orderingId, setOrderingId] = useState<string | null>(null);
  const [orderQty, setOrderQty] = useState('');
  const [favourites, setFavourites] = useState<Set<string>>(new Set());
  const [rfqSent, setRfqSent] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState('');

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'WHOLESALER')) router.push('/auth/wholesaler');
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !user) return null;

  const b2bListings = listings.filter(l => l.status === 'ACTIVE' && l.isB2b);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handlePlaceOrder = (listing: typeof b2bListings[0]) => {
    const qty = parseFloat(orderQty);
    if (!qty || qty < listing.minOrderKg) {
      showToast(`Minimum order is ${listing.minOrderKg} kg`);
      return;
    }
    const cartItem: CartItem = {
      id: `cart-${listing.id}-${Date.now()}`,
      listing_id: listing.id,
      quantity_kg: qty,
      price_per_kg: listing.pricePerKg,
      crop_name: listing.cropName,
      farmer_name: listing.farmerName,
      farmer_id: listing.farmerId,
      min_order_kg: listing.minOrderKg,
    };
    addItem(cartItem);
    setOrderingId(null);
    setOrderQty('');
    showToast(`✅ Added ${qty} kg of ${listing.cropName} to cart`);
  };

  const handleSendRFQ = (listing: typeof b2bListings[0]) => {
    setRfqSent(prev => new Set(prev).add(listing.id));
    showToast(`📨 RFQ sent to ${listing.farmerName} for ${listing.cropName}`);
  };

  const handleFavourite = (listing: typeof b2bListings[0]) => {
    setFavourites(prev => {
      const next = new Set(prev);
      if (next.has(listing.id)) { next.delete(listing.id); showToast(`Removed ${listing.farmerName} from favourites`); }
      else { next.add(listing.id); showToast(`⭐ Added ${listing.farmerName} to favourites`); }
      return next;
    });
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <DashboardNav />
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>🔍 Browse B2B Listings</h1>

        {b2bListings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ fontSize: '3rem' }}>📦</div>
            <div className="empty-state-title">No B2B listings available</div>
            <div className="empty-state-text">Check back soon for bulk produce listings.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {b2bListings.map(l => (
              <div key={l.id} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700 }}>{l.cropName}</span>
                  <span className="badge badge-green">B2B</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  {l.farmName} · {l.location}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Available</span>
                  <span style={{ fontWeight: 600 }}>{l.quantityRemaining.toLocaleString()} kg</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Price</span>
                  <span style={{ fontWeight: 700, color: 'var(--green-900)' }}>₹{l.pricePerKg}/kg</span>
                </div>

                {/* Order quantity input */}
                {orderingId === l.id ? (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input className="input" type="number" placeholder={`Min ${l.minOrderKg} kg`}
                        value={orderQty} onChange={e => setOrderQty(e.target.value)}
                        style={{ flex: 1, padding: '0.5rem' }} />
                      <button className="btn btn-primary btn-sm" onClick={() => handlePlaceOrder(l)}>✓</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setOrderingId(null); setOrderQty(''); }}>✕</button>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Min: {l.minOrderKg} kg · Total: ₹{((parseFloat(orderQty) || 0) * l.pricePerKg).toLocaleString()}
                    </div>
                  </div>
                ) : null}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-primary btn-sm" style={{ flex: 1 }}
                    onClick={() => { setOrderingId(l.id); setOrderQty(''); }}>
                    Place Order
                  </button>
                  <button className={`btn btn-sm ${rfqSent.has(l.id) ? 'btn-secondary' : 'btn-ghost'}`}
                    onClick={() => handleSendRFQ(l)} disabled={rfqSent.has(l.id)}>
                    {rfqSent.has(l.id) ? '✓ Sent' : 'Send RFQ'}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleFavourite(l)}
                    style={{ color: favourites.has(l.id) ? '#F59E0B' : undefined }}>
                    {favourites.has(l.id) ? '★' : '⭐'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '0.75rem 1.5rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 200,
          fontWeight: 600, fontSize: '0.9rem', animation: 'fadeIn 0.3s ease',
        }}>
          {toast}
        </div>
      )}
    </main>
  );
}
