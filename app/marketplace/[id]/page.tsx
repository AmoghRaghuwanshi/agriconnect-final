'use client';

import Link from 'next/link';

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  // Static data — will be replaced with Supabase fetch when DB connected
  const listing = {
    id: params.id,
    crop: 'Fresh Produce',
    farmer: 'Verified Farmer',
    location: 'India',
    price: 25,
    qty: 500,
    minOrder: 10,
    accuracy: 94,
    img: '🌾',
    description: 'Fresh, naturally grown produce directly from our family farm. No pesticides used in the last 30 days.',
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
            {listing.img}
          </div>
          {/* Details */}
          <div>
            <span className="badge badge-green" style={{ marginBottom: '1rem' }}>✅ Verified Listing #{params.id}</span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>{listing.crop}</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>👨‍🌾 {listing.farmer} · 📍 {listing.location}</p>
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 900, fontSize: '2.5rem', color: 'var(--green-900)' }}>₹{listing.price}</span>
              <span style={{ color: 'var(--text-muted)' }}>/kg</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="stat-card" style={{ flex: 1, textAlign: 'center' }}>
                <div className="stat-value" style={{ fontSize: '1.25rem' }}>{listing.qty.toLocaleString()}</div>
                <div className="stat-label">kg available</div>
              </div>
              <div className="stat-card" style={{ flex: 1, textAlign: 'center' }}>
                <div className="stat-value" style={{ fontSize: '1.25rem' }}>{listing.accuracy}%</div>
                <div className="stat-label">accuracy</div>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>{listing.description}</p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button id="add-to-cart-btn" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => alert('Sign in to add to cart')}>
                🛒 Add to Cart
              </button>
              <button id="buy-now-btn" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => alert('Sign in to buy now')}>
                ⚡ Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
