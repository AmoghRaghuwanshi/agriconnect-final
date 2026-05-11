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

/* Category tabs matching Stitch reference */
const CATEGORIES = ['All Produce', 'Vegetables', 'Grains', 'Spices', 'Fruits', 'Organic'];

export default function MarketplacePage() {
  const { listings } = useListingStore();
  const { addItem, items: cartItems } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [categoryTab, setCategoryTab] = useState('All Produce');
  const [stateFilter, setStateFilter] = useState('All States');
  const [sort, setSort] = useState('latest');
  const [mounted, setMounted] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const fetchListings = useListingStore((s) => s.fetchListings);

  useEffect(() => {
    setMounted(true);
    fetchListings(); // Load from Neon DB
  }, [fetchListings]);

  // Get only active listings (visible to consumers)
  const activeListings = useMemo(() =>
    listings.filter(l => l.status === 'ACTIVE'),
    [listings]
  );

  // Derive unique states for filter
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

    // Category filter
    if (categoryTab !== 'All Produce') {
      if (categoryTab === 'Organic') {
        result = result.filter(l => l.organic);
      } else {
        result = result.filter(l => l.category === categoryTab);
      }
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
        result = [...result].sort((a, b) => b.views - a.views);
        break;
      case 'latest':
      default:
        result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return result;
  }, [activeListings, search, categoryTab, stateFilter, sort]);

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
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingBottom: '2rem' }}>
      {/* ── Nav (Stitch buyer top bar) ───────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(249,246,240,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        height: 'var(--nav-height)', display: 'flex', alignItems: 'center',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            fontWeight: 800, fontSize: '1.25rem', color: 'var(--green-900)',
            fontFamily: "var(--font-fraunces, 'Fraunces'), serif",
            textDecoration: 'none',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--green-900)" strokeWidth="2.5">
              <path d="M7 20l5-16 5 16"/><path d="M4 17c2-4 5-6 8-6s6 2 8 6"/>
            </svg>
            AgriConnect
          </Link>

          {/* Center search */}
          <div className="hide-mobile" style={{ position: 'relative', flex: '0 1 420px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              id="marketplace-search"
              className="input"
              placeholder="Search for fresh produce..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem', borderRadius: 'var(--radius-full)', fontSize: '0.875rem', background: 'var(--bg-muted)', border: '1px solid var(--border)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Link href="/cart" style={{
              position: 'relative', color: 'var(--text-primary)',
              textDecoration: 'none', display: 'flex', alignItems: 'center', padding: '0.4rem',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
              </svg>
              {cartItems.length > 0 && (
                <span style={{
                  position: 'absolute', top: -2, right: -4, background: 'var(--terra-600)', color: '#fff',
                  borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{cartItems.length}</span>
              )}
            </Link>
            {isAuthenticated ? (
              <Link href={user?.role === 'FARMER' ? '/farmer/dashboard' : '/orders'} style={{
                width: 32, height: 32, borderRadius: '50%', background: 'var(--green-100)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', textDecoration: 'none', color: 'var(--green-900)', fontWeight: 700,
              }}>
                {user?.name?.charAt(0) || '?'}
              </Link>
            ) : (
              <Link href="/auth/consumer" className="btn btn-primary btn-sm">Sign In</Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── Category Tabs (Stitch: horizontal pill tabs) ──────────── */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', overflowX: 'auto' }}>
        <div className="container" style={{ display: 'flex', gap: '0.25rem', padding: '0.5rem 1.5rem' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategoryTab(cat)} style={{
              padding: '0.5rem 1rem', border: 'none', cursor: 'pointer',
              borderBottom: categoryTab === cat ? '2px solid var(--terra-600)' : '2px solid transparent',
              color: categoryTab === cat ? 'var(--terra-600)' : 'var(--text-secondary)',
              fontWeight: categoryTab === cat ? 700 : 500, fontSize: '0.875rem',
              background: 'transparent', fontFamily: 'inherit', whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Hero Banner (Stitch: seasonal harvest) ────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 60%, #40916C 100%)',
        color: '#fff', padding: '3.5rem 0', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 80% 40%, rgba(255,255,255,0.08) 0%, transparent 50%)',
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <span className="badge badge-green" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>SEASONAL HARVEST</span>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, maxWidth: '580px', lineHeight: 1.15, marginBottom: '0.75rem', fontStyle: 'italic', color: '#fff' }}>
            Direct from the Soil to Your Table
          </h1>
          <p style={{ maxWidth: '480px', fontSize: '0.95rem', lineHeight: 1.6, opacity: 0.85, marginBottom: '1.5rem' }}>
            Experience the unmatched flavor of locally grown, sustainably sourced produce. Picked fresh this morning, delivered to you today.
          </p>
          <Link href="#products" className="btn" style={{ background: 'var(--terra-600)', color: '#fff', padding: '0.75rem 1.75rem', borderRadius: 'var(--radius-full)' }}>
            Shop Fresh Arrivals
          </Link>
        </div>
      </div>

      {/* ── Value Propositions (3 cards) ──────────────────────────── */}
      <div className="container" style={{ padding: '2rem 1.5rem 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { icon: '🚚', title: 'Same-Day Delivery', desc: 'Order by noon for evening delivery straight from the farm.' },
            { icon: '✅', title: 'Certified Organic', desc: 'Every partner farm is vetted for sustainable, pesticide-free practices.' },
            { icon: '🤝', title: 'Fair Trade Certified', desc: 'Fair pricing that supports the livelihood of our rural growers.' },
          ].map(v => (
            <div key={v.title} className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{v.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.35rem' }}>{v.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{v.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Products Grid ────────────────────────────────────────── */}
      <div className="container" style={{ padding: '0 1.5rem 2rem' }} id="products">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, fontStyle: 'italic' }}>
            {categoryTab === 'All Produce' ? 'Trending This Week' : categoryTab}
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select id="state-filter" className="input" style={{ maxWidth: 140, cursor: 'pointer', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
              value={stateFilter} onChange={e => setStateFilter(e.target.value)}>
              {stateNames.map(s => <option key={s}>{s}</option>)}
            </select>
            <select id="sort-select" className="input" style={{ maxWidth: 140, cursor: 'pointer', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
              value={sort} onChange={e => setSort(e.target.value)}>
              <option value="latest">Latest</option>
              <option value="price-low">Price ↑</option>
              <option value="price-high">Price ↓</option>
              <option value="accuracy">Popular</option>
            </select>
          </div>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
          Showing {filtered.length} listing{filtered.length !== 1 ? 's' : ''}
          {search && <> for &quot;{search}&quot;</>}
        </p>

        {filtered.length === 0 ? (
          <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>No listings found</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Try adjusting your search or filters.
            </div>
            <button className="btn btn-outline" onClick={() => { setSearch(''); setCategoryTab('All Produce'); setStateFilter('All States'); }}>
              Clear All Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {filtered.map(listing => {
              const justAdded = addedIds.has(listing.id);
              const alreadyInCart = isInCart(listing.id);

              return (
                <div key={listing.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  {/* Image */}
                  <Link href={`/marketplace/${listing.id}`} style={{ textDecoration: 'none', display: 'block', position: 'relative' }}>
                    <div style={{
                      height: '11rem',
                      background: `linear-gradient(135deg, var(--green-50), var(--olive-100))`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '4rem', cursor: 'pointer',
                    }}>
                      {getCropEmoji(listing.category, listing.cropName)}
                    </div>
                    {listing.organic && (
                      <span className="badge badge-green" style={{ position: 'absolute', top: 10, left: 10 }}>Organic</span>
                    )}
                    {listing.views >= 50 && (
                      <span className="badge badge-amber" style={{ position: 'absolute', top: 10, left: listing.organic ? 80 : 10 }}>Bestseller</span>
                    )}
                    {/* Wishlist heart */}
                    <button style={{
                      position: 'absolute', top: 10, right: 10,
                      width: 30, height: 30, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.9)', border: '1px solid var(--border)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }} onClick={e => e.preventDefault()}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                    </button>
                  </Link>
                  <div style={{ padding: '1rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Link href={`/marketplace/${listing.id}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>{listing.cropName}</h3>
                    </Link>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                      {listing.farmerName} · {listing.location}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <div>
                        <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)', fontFamily: "var(--font-outfit, 'Outfit'), sans-serif" }}>₹{listing.pricePerKg}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> / kg</span>
                      </div>
                      <button
                        id={`add-to-cart-${listing.id}`}
                        style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: justAdded ? 'var(--green-700)' : alreadyInCart ? 'var(--green-100)' : 'var(--green-900)',
                          color: justAdded || !alreadyInCart ? '#fff' : 'var(--green-900)',
                          border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}
                        onClick={() => handleAddToCart(listing)}
                      >
                        {justAdded ? '✓' : '+'}
                      </button>
                    </div>
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
