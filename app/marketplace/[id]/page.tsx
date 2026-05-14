'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useListingStore } from '@/store/listingStore';
import { useCartStore, type CartItem } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import Header from '@/components/shared/Header';
import FloatingCartBar from '@/components/shared/FloatingCartBar';
import { ShoppingCart, CheckCircle, Zap, ArrowLeft, User, Home, MapPin, BadgeCheck, ShieldCheck, Package, Star, ChevronRight } from 'lucide-react';

function getCropImage(category: string): string {
  switch (category) {
    case 'Grains': return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80';
    case 'Vegetables': return 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=800&q=80';
    case 'Spices': return 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80';
    case 'Fruits': return 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80';
    default: return 'https://images.unsplash.com/photo-1595856720188-75f80b9125cc?auto=format&fit=crop&w=800&q=80';
  }
}

function getFarmerRating(views: number): string {
  if (views >= 100) return '4.8';
  if (views >= 50) return '4.5';
  if (views >= 20) return '4.2';
  return '4.0';
}

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const { getById, listings, fetchListings, isLoaded } = useListingStore();
  const { addItem, items: cartItems, updateQuantity, removeItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => { 
    setMounted(true); 
    if (!isLoaded) fetchListings();
  }, [isLoaded, fetchListings]);

  const listing = mounted ? getById(params.id) : undefined;

  useEffect(() => {
    if (mounted && listing) {
      setQuantity(listing.minOrderKg);
    }
  }, [mounted, listing]);

  // "More from this farmer" listings
  const moreListing = useMemo(() => {
    if (!listing) return [];
    return listings.filter(l =>
      l.farmerId === listing.farmerId &&
      l.id !== listing.id &&
      l.status === 'ACTIVE'
    );
  }, [listing, listings]);

  if (!mounted) return null;

  if (!listing) {
    notFound();
  }

  const cartItem = cartItems.find(i => i.listing_id === listing.id);
  const isInCart = !!cartItem;
  const imageUrl = listing.images && listing.images.length > 0 ? listing.images[0] : getCropImage(listing.category);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      router.push('/auth/consumer');
      return;
    }

    const item: CartItem = {
      id: `cart-${listing.id}-${Date.now()}`,
      listing_id: listing.id,
      quantity_kg: quantity,
      price_per_kg: listing.pricePerKg,
      crop_name: listing.cropName,
      farmer_name: listing.farmerName,
      farmer_id: listing.farmerId,
      min_order_kg: listing.minOrderKg,
    };

    addItem(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => router.push('/cart'), 300);
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingBottom: '5rem' }}>
      <Header />

      {/* Breadcrumb */}
      <div className="container" style={{ padding: '1rem 1.618rem 0', maxWidth: '61.8rem', margin: '0 auto' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
          <Link href="/marketplace" style={{ color: 'var(--green-700)', fontWeight: 500 }}>Marketplace</Link>
          <ChevronRight size={12} />
          <span>{listing.farmName}</span>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{listing.cropName}</span>
        </div>
      </div>

      <div className="container" style={{ padding: '1.618rem', maxWidth: '61.8rem', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.618fr 1fr', gap: '2.618rem', alignItems: 'start' }}>
          {/* Image */}
          <div style={{ position: 'sticky', top: '6rem' }}>
            <div style={{
              height: '28rem',
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border)',
              position: 'relative'
            }}>
              {listing.views >= 50 && (
                <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
                  <span className="badge badge-green" style={{ backdropFilter: 'blur(4px)', background: 'rgba(5, 150, 105, 0.9)', color: 'white', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
                    <Zap size={14} style={{ display: 'inline', marginRight: '0.2rem' }} /> Highly Demanded
                  </span>
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <div style={{ flex: 1, background: 'rgba(5, 150, 105, 0.05)', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid rgba(5, 150, 105, 0.1)' }}>
                <ShieldCheck size={24} style={{ color: 'var(--green-700)' }} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--green-900)' }}>Quality Assured</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified by AgriConnect</div>
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}><BadgeCheck size={12} /> Farmer Verified</span>
              {listing.isB2b && <span className="badge badge-blue" style={{ background: '#EFF6FF', color: '#1E40AF' }}>Wholesale Ready</span>}
            </div>

            <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.25rem', lineHeight: 1.1 }}>{listing.cropName}</h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Variety: {listing.variety}</p>

            {/* Farm Details */}
            <div className="farmer-store-card" style={{ marginBottom: '2rem' }}>
              <div className="farmer-store-header" style={{ borderBottom: 'none' }}>
                <div className="farmer-store-avatar">
                  {(listing.farmerName || 'Farmer').split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="farmer-store-info">
                  <div className="farmer-store-name">{listing.farmName}</div>
                  <div className="farmer-store-meta">
                    <span className="farmer-store-rating">
                      <Star size={10} /> {getFarmerRating(listing.views)}
                    </span>
                    <span className="meta-dot" />
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <MapPin size={12} /> {listing.location}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Price */}
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Price</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                  <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 900, fontSize: '3rem', color: 'var(--green-900)', lineHeight: 1 }}>₹{listing.pricePerKg}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>/kg</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <div className="card-flat" style={{ textAlign: 'center', padding: '1.25rem' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{listing.quantityRemaining.toLocaleString()}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>kg available</div>
              </div>
              <div className="card-flat" style={{ textAlign: 'center', padding: '1.25rem' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{listing.minOrderKg.toLocaleString()}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>kg min order</div>
              </div>
            </div>

            {/* Quantity control */}
            <div className="bill-breakdown" style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Order Quantity (kg)</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-outline" onClick={() => setQuantity(Math.max(listing.minOrderKg, quantity - listing.minOrderKg))}>−</button>
                <input
                  type="number"
                  className="input"
                  style={{ flex: 1, textAlign: 'center', fontSize: '1.2rem', fontWeight: 700 }}
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value) || listing.minOrderKg)}
                  min={listing.minOrderKg}
                  max={listing.quantityRemaining}
                />
                <button className="btn btn-outline" onClick={() => setQuantity(Math.min(listing.quantityRemaining, quantity + listing.minOrderKg))}>+</button>
              </div>
              <div className="bill-row total" style={{ marginTop: '1rem' }}>
                <span>Total Estimate</span>
                <span style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--green-900)', fontSize: '1.25rem' }}>
                  ₹{(quantity * listing.pricePerKg).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                className={`btn ${added ? 'btn-secondary' : 'btn-outline'} btn-lg`}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleAddToCart}
                disabled={quantity < listing.minOrderKg || quantity > listing.quantityRemaining}
              >
                {added ? <><CheckCircle size={18} style={{ marginRight: '0.4rem' }} /> Added!</> : <><ShoppingCart size={18} style={{ marginRight: '0.4rem' }} /> Add to Cart</>}
              </button>
              <button
                className="btn btn-primary btn-lg"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleBuyNow}
                disabled={quantity < listing.minOrderKg || quantity > listing.quantityRemaining}
              >
                Buy Now
              </button>
            </div>

            {/* Storage info */}
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--green-50)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--green-900)', fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Package size={14} /> Storage: {listing.storageType}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Harvested: {new Date(listing.harvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* More from this farmer */}
        {moreListing.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>
              More from {listing.farmName}
            </h2>
            <div className="farmer-store-card">
              <div className="farmer-store-items">
                {moreListing.map(ml => {
                  const mlImage = ml.images && ml.images.length > 0 ? ml.images[0] : getCropImage(ml.category);
                  const mlInCart = cartItems.some(i => i.listing_id === ml.id);

                  return (
                    <div key={ml.id} className="item-card">
                      <Link href={`/marketplace/${ml.id}`}>
                        <div className="item-card-img" style={{ backgroundImage: `url(${mlImage})` }} />
                      </Link>
                      <div className="item-card-info">
                        <Link href={`/marketplace/${ml.id}`} style={{ textDecoration: 'none' }}>
                          <div className="item-card-name">{ml.cropName}</div>
                        </Link>
                        <div className="item-card-variety">{ml.variety}</div>
                        <div className="item-card-price">₹{ml.pricePerKg}<span>/kg</span></div>
                      </div>
                      <div style={{ flexShrink: 0 }}>
                        {!mlInCart ? (
                          <button
                            className="item-add-btn"
                            onClick={() => {
                              if (!isAuthenticated) { router.push('/auth/consumer'); return; }
                              addItem({
                                id: `cart-${ml.id}-${Date.now()}`,
                                listing_id: ml.id,
                                quantity_kg: ml.minOrderKg,
                                price_per_kg: ml.pricePerKg,
                                crop_name: ml.cropName,
                                farmer_name: ml.farmerName,
                                farmer_id: ml.farmerId,
                                min_order_kg: ml.minOrderKg,
                              });
                            }}
                          >
                            ADD
                          </button>
                        ) : (
                          <span className="badge badge-green">In Cart</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Cart Bar */}
      <FloatingCartBar />
    </main>
  );
}
