'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useListingStore } from '@/store/listingStore';
import { useCartStore, type CartItem } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

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

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const { getById } = useListingStore();
  const { addItem, items: cartItems } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const listing = mounted ? getById(params.id) : undefined;

  useEffect(() => {
    if (mounted && listing) {
      setQuantity(listing.minOrderKg);
    }
  }, [mounted, listing]);

  if (!mounted) return null;

  if (!listing) {
    notFound();
  }

  const isInCart = cartItems.some(i => i.listing_id === listing.id);
  const emoji = getCropEmoji(listing.cropName);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      router.push('/auth/consumer');
      return;
    }

    const cartItem: CartItem = {
      id: `cart-${listing.id}-${Date.now()}`,
      listing_id: listing.id,
      quantity_kg: quantity,
      price_per_kg: listing.pricePerKg,
      crop_name: listing.cropName,
      farmer_name: listing.farmerName,
      farmer_id: listing.farmerId,
      min_order_kg: listing.minOrderKg,
    };

    addItem(cartItem);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => router.push('/cart'), 300);
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <nav style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', height: '4rem', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.3rem', color: 'var(--green-900)' }}>🌾 AgriConnect</Link>
          <Link href="/marketplace" className="btn btn-ghost btn-sm">← Back to Marketplace</Link>
        </div>
      </nav>
      <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Image */}
          <div style={{ height: '20rem', background: 'var(--green-50)', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8rem', border: '1px solid var(--border)' }}>
            {emoji}
          </div>
          {/* Details */}
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <span className="badge badge-green">✅ Verified</span>
              {listing.status === 'ACTIVE' && <span className="badge badge-green">Active</span>}
              {listing.isB2b && <span className="badge badge-blue" style={{ background: '#EFF6FF', color: '#1E40AF' }}>B2B</span>}
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>{listing.cropName}</h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{listing.variety}</p>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>👨‍🌾 {listing.farmerName} · 🏡 {listing.farmName} · 📍 {listing.location}</p>
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 900, fontSize: '2.5rem', color: 'var(--green-900)' }}>₹{listing.pricePerKg}</span>
              <span style={{ color: 'var(--text-muted)' }}>/kg</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="stat-card" style={{ flex: 1, textAlign: 'center' }}>
                <div className="stat-value" style={{ fontSize: '1.25rem' }}>{listing.quantityRemaining.toLocaleString()}</div>
                <div className="stat-label">kg available</div>
              </div>
              <div className="stat-card" style={{ flex: 1, textAlign: 'center' }}>
                <div className="stat-value" style={{ fontSize: '1.25rem' }}>{listing.views}</div>
                <div className="stat-label">views</div>
              </div>
              <div className="stat-card" style={{ flex: 1, textAlign: 'center' }}>
                <div className="stat-value" style={{ fontSize: '1.25rem' }}>{listing.minOrderKg}</div>
                <div className="stat-label">min order (kg)</div>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>{listing.description}</p>

            {/* Quantity selector */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="label" style={{ fontSize: '0.85rem' }}>Quantity (kg)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button className="btn btn-outline btn-sm" onClick={() => setQuantity(q => Math.max(listing.minOrderKg, q - listing.minOrderKg))}>−</button>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', minWidth: '3rem', textAlign: 'center' }}>{quantity}</span>
                <button className="btn btn-outline btn-sm" onClick={() => setQuantity(q => Math.min(listing.quantityRemaining, q + listing.minOrderKg))}>+</button>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>= ₹{(quantity * listing.pricePerKg).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button id="add-to-cart-btn" className={`btn ${added ? 'btn-secondary' : 'btn-primary'}`} style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleAddToCart}>
                {added ? '✅ Added to Cart!' : isInCart ? '🛒 Add More' : '🛒 Add to Cart'}
              </button>
              <button id="buy-now-btn" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleBuyNow}>
                ⚡ Buy Now
              </button>
            </div>

            {/* Storage info */}
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--green-50)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--green-900)', fontWeight: 600, marginBottom: '0.25rem' }}>📦 Storage: {listing.storageType}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Harvested: {new Date(listing.harvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
