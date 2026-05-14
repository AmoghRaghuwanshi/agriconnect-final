'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useListingStore, type Listing } from '@/store/listingStore';
import { useCartStore, type CartItem } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import {
  Search, MapPin, User, Star, Sprout, Flame, TrendingDown,
  Wheat, Leaf, ChevronRight, X,
} from 'lucide-react';
import Header from '@/components/shared/Header';
import FloatingCartBar from '@/components/shared/FloatingCartBar';
import { SkeletonFarmerStore } from '@/components/shared/SkeletonCard';

/* ── Category config ──────────────────────────────────────────────────── */
const CATEGORIES = [
  { key: 'All', icon: '🛒', label: 'All' },
  { key: 'Grains', icon: '🌾', label: 'Grains' },
  { key: 'Vegetables', icon: '🥦', label: 'Vegetables' },
  { key: 'Spices', icon: '🌶️', label: 'Spices' },
  { key: 'Fruits', icon: '🍎', label: 'Fruits' },
];

/* ── Quick filter config ──────────────────────────────────────────────── */
type QuickFilter = 'popular' | 'under50' | 'organic' | 'new';

const QUICK_FILTERS: { key: QuickFilter; label: string; icon: React.ReactNode }[] = [
  { key: 'popular', label: 'Popular', icon: <Flame size={13} /> },
  { key: 'under50', label: 'Under ₹50', icon: <TrendingDown size={13} /> },
  { key: 'organic', label: 'Organic', icon: <Leaf size={13} /> },
  { key: 'new', label: 'New Arrivals', icon: <Sprout size={13} /> },
];

/* ── Helper: crop images ──────────────────────────────────────────────── */
function getCropImage(category: string, images?: string[]): string {
  if (images && images.length > 0) return images[0];
  switch (category) {
    case 'Grains': return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80';
    case 'Vegetables': return 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=400&q=80';
    case 'Spices': return 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80';
    case 'Fruits': return 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80';
    default: return 'https://images.unsplash.com/photo-1595856720188-75f80b9125cc?auto=format&fit=crop&w=400&q=80';
  }
}

function getInitials(name: string): string {
  if (!name) return 'FM';
  return name.split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2);
}

/* ── Helper: pseudo-rating from views ─────────────────────────────────── */
function getFarmerRating(views: number): string {
  if (views >= 100) return '4.8';
  if (views >= 50) return '4.5';
  if (views >= 20) return '4.2';
  return '4.0';
}

/* ── Farmer group type ────────────────────────────────────────────────── */
interface FarmerGroup {
  farmerId: string;
  farmerName: string;
  farmName: string;
  location: string;
  state: string;
  totalViews: number;
  listings: Listing[];
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function MarketplacePage() {
  const { listings, fetchListings, isLoaded } = useListingStore();
  const { addItem, items: cartItems, updateQuantity, removeItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [activeQuickFilters, setActiveQuickFilters] = useState<Set<QuickFilter>>(new Set());
  const [mounted, setMounted] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    setMounted(true); 
    if (!isLoaded) fetchListings();
  }, [isLoaded, fetchListings]);

  // Close autocomplete on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowAutocomplete(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Active listings ──────────────────────────────────────────────── */
  const activeListings = useMemo(() =>
    listings.filter(l => l.status === 'ACTIVE'),
    [listings]
  );

  /* ── Autocomplete suggestions ─────────────────────────────────────── */
  const suggestions = useMemo(() => {
    if (!search.trim() || search.trim().length < 2) return [];
    const q = search.toLowerCase();
    const results: { type: 'crop' | 'farmer' | 'location'; text: string; sub: string }[] = [];
    const seen = new Set<string>();

    for (const l of activeListings) {
      // Crop matches
      if (l.cropName.toLowerCase().includes(q) && !seen.has(`crop-${l.cropName}`)) {
        seen.add(`crop-${l.cropName}`);
        results.push({ type: 'crop', text: l.cropName, sub: l.category });
      }
      // Farmer matches
      if (l.farmerName.toLowerCase().includes(q) && !seen.has(`farmer-${l.farmerId}`)) {
        seen.add(`farmer-${l.farmerId}`);
        results.push({ type: 'farmer', text: l.farmerName, sub: l.location });
      }
      // Variety matches
      if (l.variety.toLowerCase().includes(q) && !seen.has(`crop-${l.variety}`)) {
        seen.add(`crop-${l.variety}`);
        results.push({ type: 'crop', text: l.variety, sub: l.cropName });
      }
      // Location matches
      if (l.location.toLowerCase().includes(q) && !seen.has(`loc-${l.location}`)) {
        seen.add(`loc-${l.location}`);
        results.push({ type: 'location', text: l.location, sub: `${l.state}` });
      }
    }
    return results.slice(0, 8);
  }, [search, activeListings]);

  /* ── Apply all filters ────────────────────────────────────────────── */
  const filtered = useMemo(() => {
    let result = activeListings;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.cropName.toLowerCase().includes(q) ||
        l.farmerName.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q) ||
        l.variety.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (categoryFilter !== 'All') {
      result = result.filter(l => l.category === categoryFilter);
    }

    // Quick filters
    if (activeQuickFilters.has('popular')) {
      result = result.filter(l => l.views >= 50);
    }
    if (activeQuickFilters.has('under50')) {
      result = result.filter(l => l.pricePerKg < 50);
    }
    if (activeQuickFilters.has('organic')) {
      result = result.filter(l =>
        l.description.toLowerCase().includes('organic') ||
        l.farmName.toLowerCase().includes('organic')
      );
    }
    if (activeQuickFilters.has('new')) {
      const weekAgo = new Date(Date.now() - 7 * 86400000);
      result = result.filter(l => new Date(l.createdAt) >= weekAgo);
    }

    return result;
  }, [activeListings, search, categoryFilter, activeQuickFilters]);

  /* ── Group by farmer ──────────────────────────────────────────────── */
  const farmerGroups = useMemo(() => {
    const map = new Map<string, FarmerGroup>();

    for (const listing of filtered) {
      let group = map.get(listing.farmerId);
      if (!group) {
        group = {
          farmerId: listing.farmerId,
          farmerName: listing.farmerName,
          farmName: listing.farmName,
          location: listing.location,
          state: listing.state,
          totalViews: 0,
          listings: [],
        };
        map.set(listing.farmerId, group);
      }
      group.listings.push(listing);
      group.totalViews += listing.views;
    }

    // Sort: most popular farmers first
    return Array.from(map.values()).sort((a, b) => b.totalViews - a.totalViews);
  }, [filtered]);

  /* ── Cart helpers ─────────────────────────────────────────────────── */
  const getCartItem = useCallback((listingId: string) =>
    cartItems.find(i => i.listing_id === listingId),
    [cartItems]
  );

  const handleAdd = useCallback((listing: typeof activeListings[0]) => {
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
      image_url: getCropImage(listing.category, listing.images),
    };
    addItem(cartItem);
  }, [isAuthenticated, router, addItem]);

  const handleIncrement = useCallback((listingId: string, currentQty: number, minOrder: number) => {
    updateQuantity(listingId, currentQty + minOrder);
  }, [updateQuantity]);

  const handleDecrement = useCallback((listingId: string, currentQty: number, minOrder: number) => {
    const newQty = currentQty - minOrder;
    if (newQty <= 0) {
      removeItem(listingId);
    } else {
      updateQuantity(listingId, newQty);
    }
  }, [updateQuantity, removeItem]);

  const toggleQuickFilter = useCallback((key: QuickFilter) => {
    setActiveQuickFilters(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  if (!mounted) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
        <Header />
        <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '1.25rem 0 1rem' }}>
          <div className="container" style={{ maxWidth: '48rem' }}>
            <div className="skeleton" style={{ height: '3rem', borderRadius: 'var(--radius-full)', marginBottom: '1rem' }} />
            <div className="category-scroll" style={{ marginTop: '1rem' }}>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="skeleton" style={{ width: '5rem', height: '4.5rem', borderRadius: 'var(--radius-lg)', flexShrink: 0 }} />
              ))}
            </div>
          </div>
        </div>
        <div className="container" style={{ padding: '1.5rem 1.5rem 6rem', maxWidth: '64rem', margin: '0 auto' }}>
          <SkeletonFarmerStore />
          <SkeletonFarmerStore />
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Header />

      {/* ── Search + Filters Section ──────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        padding: '1.25rem 0 1rem',
      }}>
        <div className="container" style={{ maxWidth: '64rem' }}>
          {/* Search */}
          <div className="consumer-search-wrapper" ref={searchRef}>
            <Search size={18} className="consumer-search-icon" />
            <input
              id="marketplace-search"
              className="consumer-search"
              placeholder='Search for "tomato", "wheat", "Patel Farm"...'
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setShowAutocomplete(e.target.value.trim().length >= 2);
              }}
              onFocus={() => {
                if (search.trim().length >= 2) setShowAutocomplete(true);
              }}
            />
            {search && (
              <button
                onClick={() => { setSearch(''); setShowAutocomplete(false); }}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)', background: 'var(--bg-base)',
                  border: 'none', borderRadius: '50%', width: '1.5rem',
                  height: '1.5rem', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)',
                }}
              >
                <X size={12} />
              </button>
            )}

            {/* Autocomplete dropdown */}
            {showAutocomplete && suggestions.length > 0 && (
              <div className="search-autocomplete">
                {suggestions.map((s, i) => (
                  <div
                    key={`${s.type}-${s.text}-${i}`}
                    className="search-autocomplete-item"
                    onClick={() => {
                      setSearch(s.text);
                      setShowAutocomplete(false);
                    }}
                  >
                    <div style={{ color: 'var(--text-muted)' }}>
                      {s.type === 'crop' && <Wheat size={16} />}
                      {s.type === 'farmer' && <User size={16} />}
                      {s.type === 'location' && <MapPin size={16} />}
                    </div>
                    <div>
                      <div className="search-match">{s.text}</div>
                      <div className="search-sub">{s.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category Carousel */}
          <div className="category-scroll" style={{ marginTop: '1rem' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                className={`category-pill ${categoryFilter === cat.key ? 'active' : ''}`}
                onClick={() => setCategoryFilter(cat.key)}
              >
                <span className="category-pill-icon">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Quick Filter Chips */}
          <div className="filter-chips" style={{ marginTop: '0.75rem' }}>
            {QUICK_FILTERS.map(f => (
              <button
                key={f.key}
                className={`filter-chip ${activeQuickFilters.has(f.key) ? 'active' : ''}`}
                onClick={() => toggleQuickFilter(f.key)}
              >
                {f.icon} {f.label}
              </button>
            ))}
            {(categoryFilter !== 'All' || activeQuickFilters.size > 0 || search) && (
              <button
                className="filter-chip"
                style={{ color: '#DC2626', borderColor: '#FECACA' }}
                onClick={() => {
                  setCategoryFilter('All');
                  setActiveQuickFilters(new Set());
                  setSearch('');
                }}
              >
                <X size={13} /> Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Results Count ─────────────────────────────────────────────── */}
      <div className="container" style={{ padding: '1.5rem 1.5rem 0', maxWidth: '64rem', margin: '0 auto' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          {filtered.length} item{filtered.length !== 1 ? 's' : ''} from {farmerGroups.length} farm{farmerGroups.length !== 1 ? 's' : ''}
          {search && <> matching &quot;{search}&quot;</>}
          {categoryFilter !== 'All' && <> in <strong>{categoryFilter}</strong></>}
        </p>
      </div>

      {/* ── Farmer Store Cards ────────────────────────────────────────── */}
      <div className="container" style={{ padding: '0 1.5rem 6rem', maxWidth: '64rem', margin: '0 auto' }}>
        {farmerGroups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <Search size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>No produce found</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Try adjusting your search or filters.
            </div>
            <button
              className="btn btn-outline"
              onClick={() => { setSearch(''); setCategoryFilter('All'); setActiveQuickFilters(new Set()); }}
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
            {farmerGroups.map(group => (
              <div key={group.farmerId} className="farmer-store-card" style={{ marginBottom: 0 }}>
              {/* Farmer Header */}
              <div className="farmer-store-header">
                <div className="farmer-store-avatar">
                  {(group.farmerName || 'Farmer').split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="farmer-store-info">
                  <div className="farmer-store-name">{group.farmName}</div>
                  <div className="farmer-store-meta">
                    <span className="farmer-store-rating">
                      <Star size={10} /> {getFarmerRating(group.totalViews)}
                    </span>
                    <span className="meta-dot" />
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <MapPin size={12} /> {group.location}
                    </span>
                    <span className="meta-dot" />
                    <span>{group.listings.length} item{group.listings.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
              </div>

              {/* Item Rows */}
              <div className="farmer-store-items">
                {group.listings.map(listing => {
                  const cartItem = getCartItem(listing.id);
                  const inCart = !!cartItem;
                  const imageUrl = getCropImage(listing.category, listing.images);

                  return (
                    <div key={listing.id} className="item-card">
                      {/* Image */}
                      <Link href={`/marketplace/${listing.id}`}>
                        <div
                          className="item-card-img"
                          style={{ backgroundImage: `url(${imageUrl})` }}
                        />
                      </Link>

                      {/* Info */}
                      <div className="item-card-info">
                        <Link href={`/marketplace/${listing.id}`} style={{ textDecoration: 'none' }}>
                          <div className="item-card-name">{listing.cropName}</div>
                        </Link>
                        <div className="item-card-variety">{listing.variety} · {listing.quantityRemaining.toLocaleString()} kg available</div>
                        <div className="item-card-price">
                          ₹{listing.pricePerKg}<span>/kg</span>
                        </div>
                        <div className="item-card-detail">Min order: {listing.minOrderKg} kg</div>
                      </div>

                      {/* ADD / Qty Control */}
                      <div style={{ flexShrink: 0 }}>
                        {!inCart ? (
                          <button
                            className="item-add-btn"
                            onClick={() => handleAdd(listing)}
                            id={`add-to-cart-${listing.id}`}
                          >
                            ADD
                          </button>
                        ) : (
                          <div className="item-qty-control animate-pop-in">
                            <button
                              onClick={() => handleDecrement(listing.id, cartItem.quantity_kg, listing.minOrderKg)}
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="qty-value">{cartItem.quantity_kg}</span>
                            <button
                              onClick={() => handleIncrement(listing.id, cartItem.quantity_kg, listing.minOrderKg)}
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          </div>
        )}
      </div>

      {/* ── Floating Cart Bar ─────────────────────────────────────────── */}
      <FloatingCartBar />
    </main>
  );
}
