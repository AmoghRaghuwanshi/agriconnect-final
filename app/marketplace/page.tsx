'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { useListingStore } from '@/store/listingStore';
import { useCartStore, type CartItem } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

// Emoji map for crop categories — keeps the visual style from the original
const CROP_EMOJI: Record<string, string> = {
  'Grains': '🌾',
  'Vegetables': '🥬',
  'Spices': '🌶️',
  'Fruits': '🍎',
};

function getCropEmoji(category: string, cropName: string): string {
  // Specific crop overrides
  const lower = cropName.toLowerCase();
  if (lower.includes('wheat')) return '🌾';
  if (lower.includes('rice') || lower.includes('basmati')) return '🍚';
  if (lower.includes('tomato')) return '🍅';
  if (lower.includes('onion')) return '🧅';
  if (lower.includes('potato')) return '🥔';
  if (lower.includes('chili') || lower.includes('mirch')) return '🌶️';
  if (lower.includes('maize') || lower.includes('corn')) return '🌽';
  if (lower.includes('turmeric')) return '🟡';
  return CROP_EMOJI[category] ?? '🌿';
}

export default function MarketplacePage() {
  const { listings } = useListingStore();
  const { addItem, items: cartItems } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [cropFilter, setCropFilter] = useState('All Crops');
  const [stateFilter, setStateFilter] = useState('All States');
  const [sort, setSort] = useState('latest');
  const [mounted, setMounted] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => { setMounted(true); }, []);

  // Get only active listings (visible to consumers)
  const activeListings = useMemo(() =>
    listings.filter(l => l.status === 'ACTIVE'),
    [listings]
  );

  // Derive unique crop names and states for filter dropdowns
  const cropNames = useMemo(() => {
    const names = new Set(activeListings.map(l => l.cropName));
    return ['All Crops', ...Array.from(names).sort()];
  }, [activeListings]);

  const stateNames = useMemo(() => {
    const names = new Set(activeListings.map(l => l.state).filter(Boolean));
    return ['All States', ...Array.from(names).sort()];
  }, [activeListings]);

  // Apply search, filter, and sort
  const filtered = useMemo(() => {
    let result = activeListings;

    // Search — matches crop name, farmer name, location
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.cropName.toLowerCase().includes(q) ||
        l.farmerName.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q) ||
        l.variety.toLowerCase().includes(q)
      );
    }

    // Crop filter
    if (cropFilter !== 'All Crops') {
      result = result.filter(l => l.cropName === cropFilter);
    }

    // State filter
    if (stateFilter !== 'All States') {
      result = result.filter(l => l.state === stateFilter);
    }

    // Sort
    switch (sort) {
      case 'price-low':
        result = [...result].sort((a, b) => a.pricePerKg - b.pricePerKg);
        break;
      case 'price-high':
        result = [...result].sort((a, b) => b.pricePerKg - a.pricePerKg);
        break;
      case 'accuracy':
        result = [...result].sort((a, b) => b.views - a.views); // Use views as proxy for accuracy/popularity
        break;
      case 'latest':
      default:
        result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return result;
  }, [activeListings, search, cropFilter, stateFilter, sort]);

  const handleAddToCart = (listing: typeof activeListings[0]) => {
    if (!isAuthenticated) {
      router.push('/auth/consumer');
      return;
    }

    const cartItem: CartItem = {
      id: `cart-${listing.id}-${Date.now()}`,
      listing_id: listing.id,
      quantity_kg: listing.minOrderKg,
      price_per_kg: listing.pricePerKg,
      crop_name: listing.cropName,
      farmer_name: listing.farmerName,
      farmer_id: listing.farmerId,
      min_order_kg: listing.minOrderKg,
    };

    addItem(cartItem);
    setAddedIds(prev => new Set(prev).add(listing.id));
    // Reset feedback after 2s
    setTimeout(() => {
      setAddedIds(prev => {
        const next = new Set(prev);
        next.delete(listing.id);
        return next;
      });
    }, 2000);
  };

  const isInCart = (listingId: string) =>
    cartItems.some(i => i.listing_id === listingId);

  if (!mounted) return null;

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(245,245,240,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', height: '4rem', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.3rem', color: 'var(--green-900)' }}>🌾 AgriConnect</Link>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link href="/mandi" className="btn btn-ghost btn-sm">Mandi Prices</Link>
            <Link href="/cart" className="btn btn-outline btn-sm">
              🛒 Cart{cartItems.length > 0 && ` (${cartItems.length})`}
            </Link>
            {isAuthenticated ? (
              <Link href={user?.role === 'FARMER' ? '/farmer/dashboard' : '/orders'} className="btn btn-primary btn-sm">
                {user?.avatar} {user?.name?.split(' ')[0]}
              </Link>
            ) : (
              <Link href="/auth/consumer" className="btn btn-primary btn-sm">Sign In</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Header + Filter bar */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '1.5rem 0' }}>
        <div className="container">
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }}>Fresh Produce Marketplace</h1>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              id="marketplace-search"
              className="input"
              placeholder="🔍 Search crops, farmers..."
              style={{ maxWidth: '320px', flex: 1 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              id="crop-filter"
              className="input"
              style={{ maxWidth: '180px', cursor: 'pointer' }}
              value={cropFilter}
              onChange={e => setCropFilter(e.target.value)}
            >
              {cropNames.map(c => <option key={c}>{c}</option>)}
            </select>
            <select
              id="state-filter"
              className="input"
              style={{ maxWidth: '180px', cursor: 'pointer' }}
              value={stateFilter}
              onChange={e => setStateFilter(e.target.value)}
            >
              {stateNames.map(s => <option key={s}>{s}</option>)}
            </select>
            <select
              id="sort-select"
              className="input"
              style={{ maxWidth: '180px', cursor: 'pointer' }}
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="latest">Sort: Latest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="accuracy">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          Showing {filtered.length} listing{filtered.length !== 1 ? 's' : ''}
          {search && <> for &quot;{search}&quot;</>}
          {cropFilter !== 'All Crops' && <> in {cropFilter}</>}
          {stateFilter !== 'All States' && <> from {stateFilter}</>}
        </p>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>No listings found</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Try adjusting your search or filters.
            </div>
            <button className="btn btn-outline" onClick={() => { setSearch(''); setCropFilter('All Crops'); setStateFilter('All States'); }}>
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="bento bento-4" style={{ gap: '1.25rem' }}>
            {filtered.map(listing => {
              const justAdded = addedIds.has(listing.id);
              const alreadyInCart = isInCart(listing.id);

              return (
                <div key={listing.id} className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  {/* Image placeholder */}
                  <Link href={`/marketplace/${listing.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{ height: '10rem', background: 'var(--green-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                      {getCropEmoji(listing.category, listing.cropName)}
                    </div>
                  </Link>
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <Link href={`/marketplace/${listing.id}`} style={{ textDecoration: 'none' }}>
                        <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{listing.cropName}</h3>
                      </Link>
                      <span className={`badge ${listing.views >= 50 ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: '0.65rem', flexShrink: 0 }}>
                        {listing.views >= 50 ? '✅ Popular' : '⚡ New'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      👨‍🌾 {listing.farmerName} · 📍 {listing.location}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.25rem', color: 'var(--green-900)' }}>₹{listing.pricePerKg}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/kg</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{listing.quantityRemaining.toLocaleString()} kg left</span>
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Min order: {listing.minOrderKg} kg
                    </div>
                    {/* Add to Cart button */}
                    <button
                      id={`add-to-cart-${listing.id}`}
                      className={`btn ${justAdded ? 'btn-secondary' : alreadyInCart ? 'btn-outline' : 'btn-primary'} btn-sm`}
                      style={{
                        width: '100%', justifyContent: 'center', marginTop: 'auto', paddingTop: '0.75rem',
                        marginBlockStart: '1rem',
                      }}
                      onClick={(e) => { e.preventDefault(); handleAddToCart(listing); }}
                    >
                      {justAdded ? '✅ Added!' : alreadyInCart ? '🛒 Add More' : '🛒 Add to Cart'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
