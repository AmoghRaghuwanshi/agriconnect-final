'use client';

import Link from 'next/link';

// Seed listings — replaced by Supabase query when DB connected
const LISTINGS = [
  { id: '1', crop: 'Wheat (Lokwan)', farmer: 'Raju Patel', location: 'Indore, MP', price: 28, qty: 500, unit: 'kg', img: '🌾', badge: 'Reliable', accuracy: 96, minOrder: 10 },
  { id: '2', crop: 'Fresh Tomatoes', farmer: 'Suresh Kumar', location: 'Nashik, MH', price: 15, qty: 200, unit: 'kg', img: '🍅', badge: 'Reliable', accuracy: 92, minOrder: 5 },
  { id: '3', crop: 'Basmati Rice', farmer: 'Gurpreet Singh', location: 'Amritsar, PB', price: 55, qty: 1000, unit: 'kg', img: '🍚', badge: 'Check qty', accuracy: 78, minOrder: 25 },
  { id: '4', crop: 'Onion (Red)', farmer: 'Ramesh Patil', location: 'Pune, MH', price: 18, qty: 800, unit: 'kg', img: '🧅', badge: 'Reliable', accuracy: 94, minOrder: 20 },
  { id: '5', crop: 'Potato (Agra)', farmer: 'Mahesh Yadav', location: 'Agra, UP', price: 12, qty: 2000, unit: 'kg', img: '🥔', badge: 'Reliable', accuracy: 91, minOrder: 50 },
  { id: '6', crop: 'Green Chili', farmer: 'Venkat Rao', location: 'Guntur, AP', price: 45, qty: 100, unit: 'kg', img: '🌶️', badge: 'Reliable', accuracy: 89, minOrder: 2 },
  { id: '7', crop: 'Maize (Yellow)', farmer: 'Dilip Sahu', location: 'Patna, BR', price: 22, qty: 3000, unit: 'kg', img: '🌽', badge: 'Check qty', accuracy: 75, minOrder: 100 },
  { id: '8', crop: 'Fresh Turmeric', farmer: 'Nagaraju Reddy', location: 'Nizamabad, TS', price: 85, qty: 150, unit: 'kg', img: '🟡', badge: 'Reliable', accuracy: 97, minOrder: 5 },
];

const CROPS = ['All Crops', 'Wheat', 'Rice', 'Tomatoes', 'Onion', 'Potato', 'Chili', 'Maize', 'Turmeric'];

export default function MarketplacePage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(245,245,240,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', height: '4rem', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.3rem', color: 'var(--green-900)' }}>🌾 AgriConnect</Link>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link href="/mandi" className="btn btn-ghost btn-sm">Mandi Prices</Link>
            <Link href="/cart" className="btn btn-outline btn-sm">🛒 Cart</Link>
            <Link href="/auth/consumer" className="btn btn-primary btn-sm">Sign In</Link>
          </div>
        </div>
      </nav>

      {/* Header + Filter bar */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '1.5rem 0' }}>
        <div className="container">
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }}>Fresh Produce Marketplace</h1>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input className="input" placeholder="🔍 Search crops, farmers..." style={{ maxWidth: '320px', flex: 1 }} readOnly />
            <select className="input" style={{ maxWidth: '160px', cursor: 'pointer' }}>
              {CROPS.map(c => <option key={c}>{c}</option>)}
            </select>
            <select className="input" style={{ maxWidth: '160px', cursor: 'pointer' }}>
              <option>All States</option>
              <option>Maharashtra</option>
              <option>Punjab</option>
              <option>Uttar Pradesh</option>
              <option>Madhya Pradesh</option>
              <option>Karnataka</option>
            </select>
            <select className="input" style={{ maxWidth: '160px', cursor: 'pointer' }}>
              <option>Sort: Latest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Highest Accuracy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          Showing {LISTINGS.length} listings
        </p>
        <div className="bento bento-4" style={{ gap: '1.25rem' }}>
          {LISTINGS.map(listing => (
            <Link key={listing.id} href={`/marketplace/${listing.id}`} style={{ textDecoration: 'none', display: 'block' }}>
              <div className="card" style={{ padding: '0', overflow: 'hidden', cursor: 'pointer' }}>
                {/* Image placeholder */}
                <div style={{ height: '10rem', background: 'var(--green-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', borderBottom: '1px solid var(--border)' }}>
                  {listing.img}
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{listing.crop}</h3>
                    <span className={`badge ${listing.accuracy >= 90 ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: '0.65rem' }}>
                      {listing.accuracy >= 90 ? '✅' : '⚡'} {listing.badge}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    👨‍🌾 {listing.farmer} · 📍 {listing.location}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.25rem', color: 'var(--green-900)' }}>₹{listing.price}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/kg</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{listing.qty.toLocaleString()} kg left</span>
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Min order: {listing.minOrder} kg
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Load more */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <button className="btn btn-outline" id="load-more-btn" onClick={() => alert('Connect Supabase to load more listings')}>
            Load More Listings
          </button>
        </div>
      </div>
    </main>
  );
}
