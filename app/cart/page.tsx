'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore, type CartItem } from '@/store/cartStore';
import { useListingStore } from '@/store/listingStore';
import Header from '@/components/shared/Header';
import RecommendationSection from '@/components/shared/RecommendationSection';
import { useRecommendations } from '@/hooks/useRecommendations';
import { SkeletonCartRow } from '@/components/shared/SkeletonCard';
import { ShoppingCart, ArrowRight, ShieldCheck, User, Trash2, Tag } from 'lucide-react';

function getCropImage(imageUrl?: string): string {
  if (imageUrl) return imageUrl;
  return 'https://images.unsplash.com/photo-1595856720188-75f80b9125cc?auto=format&fit=crop&w=400&q=80';
}

function getCropImageForListing(category: string, images?: string[]): string {
  if (images && images.length > 0) return images[0];
  switch (category) {
    case 'Grains': return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80';
    case 'Vegetables': return 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=400&q=80';
    case 'Spices': return 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80';
    case 'Fruits': return 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80';
    default: return 'https://images.unsplash.com/photo-1595856720188-75f80b9125cc?auto=format&fit=crop&w=400&q=80';
  }
}

export default function CartPage() {
  const { isAuthenticated } = useAuthStore();
  const { items, updateQuantity, removeItem, total, addItem } = useCartStore();
  const { listings } = useListingStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Group items by farmer
  const farmerGroups = useMemo(() => {
    const map = new Map<string, { farmerName: string; farmerId: string; items: typeof items }>();
    for (const item of items) {
      let group = map.get(item.farmer_id);
      if (!group) {
        group = { farmerName: item.farmer_name || 'Unknown Farmer', farmerId: item.farmer_id || 'unknown', items: [] };
        map.set(item.farmer_id, group);
      }
      group.items.push(item);
    }
    return Array.from(map.values());
  }, [items]);

  // Recommendation config — derived from cart contents
  const recoConfig = useMemo(() => {
    const cartCropNames = items.map((i) => i.crop_name);
    const cartFarmerIds = [...new Set(items.map((i) => i.farmer_id))];
    const cartListingIds = items.map((i) => i.listing_id);
    // Get categories from the listing store
    const cartCategories = items
      .map((i) => {
        const listing = listings.find((l) => l.id === i.listing_id);
        return listing?.category;
      })
      .filter(Boolean) as string[];

    return { cartCropNames, cartFarmerIds, cartListingIds, cartCategories, maxPerSection: 6, isB2B: false };
  }, [items, listings]);

  const recommendations = useRecommendations(recoConfig);

  // Cart helpers for recommendation cards
  const getCartItem = useCallback(
    (listingId: string) => items.find((i) => i.listing_id === listingId),
    [items]
  );

  const handleRecoAdd = useCallback(
    (listing: { id: string; cropName: string; farmerName: string; farmerId: string; pricePerKg: number; minOrderKg: number; category: string; images: string[] }) => {
      if (!isAuthenticated) { router.push('/auth/consumer'); return; }
      const cartItem: CartItem = {
        id: `cart-${listing.id}-${Date.now()}`,
        listing_id: listing.id,
        quantity_kg: listing.minOrderKg,
        price_per_kg: listing.pricePerKg,
        crop_name: listing.cropName,
        farmer_name: listing.farmerName,
        farmer_id: listing.farmerId,
        min_order_kg: listing.minOrderKg,
        image_url: getCropImageForListing(listing.category, listing.images),
      };
      addItem(cartItem);
    },
    [isAuthenticated, router, addItem]
  );

  const handleRecoIncrement = useCallback(
    (listingId: string, currentQty: number, minOrder: number) => {
      updateQuantity(listingId, currentQty + minOrder);
    },
    [updateQuantity]
  );

  const handleRecoDecrement = useCallback(
    (listingId: string, currentQty: number, minOrder: number) => {
      const newQty = currentQty - minOrder;
      if (newQty <= 0) removeItem(listingId);
      else updateQuantity(listingId, newQty);
    },
    [updateQuantity, removeItem]
  );

  if (!mounted) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
        <Header />
        <div className="container" style={{ padding: '2rem 1.5rem 4rem', maxWidth: '48rem', margin: '0 auto' }}>
          <div className="skeleton" style={{ width: '10rem', height: '1.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }} />
          <div className="cart-farmer-group">
            <div className="cart-farmer-header">
              <div className="skeleton" style={{ width: '2rem', height: '2rem', borderRadius: 'var(--radius-sm)' }} />
              <div className="skeleton" style={{ width: '8rem', height: '1rem', borderRadius: 'var(--radius-sm)' }} />
            </div>
            <SkeletonCartRow />
            <SkeletonCartRow />
          </div>
          <div className="cart-farmer-group">
            <div className="cart-farmer-header">
              <div className="skeleton" style={{ width: '2rem', height: '2rem', borderRadius: 'var(--radius-sm)' }} />
              <div className="skeleton" style={{ width: '10rem', height: '1rem', borderRadius: 'var(--radius-sm)' }} />
            </div>
            <SkeletonCartRow />
          </div>
        </div>
      </main>
    );
  }

  const subtotal = total();
  const deliveryFee = 0;
  const platformFee = 0;
  const grandTotal = subtotal + deliveryFee + platformFee;

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Header />

      <div className="container" style={{ padding: '2rem 1.5rem 4rem', maxWidth: '48rem', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShoppingCart size={24} /> Cart
          {items.length > 0 && (
            <span style={{
              fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)',
              background: 'var(--bg-base)', padding: '0.15rem 0.6rem',
              borderRadius: 'var(--radius-full)',
            }}>
              {items.length} item{items.length !== 1 ? 's' : ''}
            </span>
          )}
        </h1>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
              <ShoppingCart size={48} style={{ color: 'var(--text-muted)' }} />
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Your cart is empty</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Browse the marketplace to add fresh produce from verified farmers.
            </div>
            <Link href="/marketplace" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', alignItems: 'start' }}>
            {/* Left — Items grouped by farmer */}
            <div>
              {farmerGroups.map(group => (
                <div key={group.farmerId} className="cart-farmer-group">
                  {/* Farmer header */}
                  <div className="cart-farmer-header">
                    <div style={{
                      width: '2rem', height: '2rem', borderRadius: 'var(--radius-sm)',
                      background: 'linear-gradient(135deg, var(--green-600), var(--green-900))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: '0.7rem', fontWeight: 800,
                    }}>
                      {(group.farmerName || 'Unknown Farmer').split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="cart-farmer-name">
                      <User size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem', color: 'var(--text-muted)' }} />
                      {group.farmerName}
                    </div>
                  </div>

                  {/* Items */}
                  {group.items.map(item => (
                    <div key={item.listing_id} className="cart-item-row">
                      {/* Thumbnail */}
                      <div style={{
                        width: '3.5rem', height: '3.5rem', borderRadius: 'var(--radius-sm)',
                        backgroundImage: `url(${getCropImage(item.image_url)})`,
                        backgroundSize: 'cover', backgroundPosition: 'center',
                        flexShrink: 0, border: '1px solid var(--border)',
                      }} />

                      {/* Info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.1rem' }}>{item.crop_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          ₹{item.price_per_kg}/kg
                        </div>
                      </div>

                      {/* Quantity control */}
                      <div className="item-qty-control" style={{ minWidth: '5.5rem' }}>
                        <button
                          onClick={() => {
                            const newQty = item.quantity_kg - (item.min_order_kg ?? 1);
                            if (newQty <= 0) removeItem(item.listing_id);
                            else updateQuantity(item.listing_id, newQty);
                          }}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="qty-value">{item.quantity_kg}</span>
                        <button
                          onClick={() => updateQuantity(item.listing_id, item.quantity_kg + (item.min_order_kg ?? 1))}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Total + Remove */}
                      <div style={{ textAlign: 'right', minWidth: '4.5rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          ₹{(item.price_per_kg * item.quantity_kg).toLocaleString()}
                        </div>
                        <button
                          onClick={() => removeItem(item.listing_id)}
                          style={{
                            fontSize: '0.7rem', color: '#DC2626', background: 'none',
                            border: 'none', cursor: 'pointer', marginTop: '0.2rem',
                            display: 'flex', alignItems: 'center', gap: '0.2rem', marginLeft: 'auto',
                          }}
                        >
                          <Trash2 size={10} /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* ── Recommendations ──────────────────────────────────────── */}
              {recommendations.map((group) => (
                <RecommendationSection
                  key={group.title}
                  group={group}
                  variant="consumer"
                  onAdd={handleRecoAdd}
                  getCartItem={getCartItem}
                  onIncrement={handleRecoIncrement}
                  onDecrement={handleRecoDecrement}
                />
              ))}

              {/* Coupon placeholder */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '1rem 1.25rem', background: 'var(--bg-card)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)',
                cursor: 'pointer', marginTop: '0.5rem',
              }}>
                <Tag size={18} style={{ color: 'var(--green-700)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Apply Coupon</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Save more on your order</div>
                </div>
                <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>

            {/* Right — Bill Breakdown */}
            <div style={{ position: 'sticky', top: '5rem' }}>
              <div className="bill-breakdown">
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem' }}>
                  Bill Details
                </h2>

                <div className="bill-row">
                  <span className="bill-label">Item Total</span>
                  <span className="bill-value">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="bill-row">
                  <span className="bill-label">Delivery Fee</span>
                  <span className="bill-free">FREE</span>
                </div>
                <div className="bill-row">
                  <span className="bill-label">Platform Fee</span>
                  <span className="bill-free">₹0</span>
                </div>

                <div style={{
                  background: 'rgba(5, 150, 105, 0.05)', borderRadius: '8px',
                  padding: '0.6rem 0.75rem', display: 'flex', alignItems: 'center',
                  gap: '0.5rem', margin: '0.75rem 0', border: '1px solid rgba(5, 150, 105, 0.1)',
                }}>
                  <ShieldCheck size={14} style={{ color: 'var(--green-700)', flexShrink: 0 }} />
                  <div style={{ fontSize: '0.72rem', color: 'var(--green-900)' }}>
                    100% Quality Guarantee on all produce
                  </div>
                </div>

                <div className="bill-row total">
                  <span>To Pay</span>
                  <span style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--green-900)', fontSize: '1.25rem' }}>
                    ₹{grandTotal.toLocaleString()}
                  </span>
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '1.25rem', padding: '0.875rem' }}
                  onClick={() => {
                    if (!isAuthenticated) { router.push('/auth/consumer'); return; }
                    router.push('/checkout');
                  }}
                >
                  Proceed to Checkout <ArrowRight size={16} style={{ marginLeft: '0.25rem' }} />
                </button>

                <Link
                  href="/marketplace"
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
