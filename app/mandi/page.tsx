'use client';

import Link from 'next/link';

// Static seed data — will be replaced with Supabase ISR when DB is connected
const MANDI_DATA = [
  { crop: 'Wheat (Lokwan)', state: 'Madhya Pradesh', market: 'Indore', price: 2450, prev: 2380, unit: 'qtl' },
  { crop: 'Rice (Basmati)', state: 'Punjab', market: 'Amritsar', price: 3800, prev: 3750, unit: 'qtl' },
  { crop: 'Onion', state: 'Maharashtra', market: 'Nashik', price: 1200, prev: 1350, unit: 'qtl' },
  { crop: 'Tomato', state: 'Karnataka', market: 'Kolar', price: 800, prev: 650, unit: 'qtl' },
  { crop: 'Potato', state: 'Uttar Pradesh', market: 'Agra', price: 950, prev: 1050, unit: 'qtl' },
  { crop: 'Maize', state: 'Bihar', market: 'Patna', price: 1850, prev: 1800, unit: 'qtl' },
  { crop: 'Mustard', state: 'Rajasthan', market: 'Alwar', price: 5200, prev: 5100, unit: 'qtl' },
  { crop: 'Chili', state: 'Andhra Pradesh', market: 'Guntur', price: 7800, prev: 8200, unit: 'qtl' },
  { crop: 'Soybean', state: 'Maharashtra', market: 'Latur', price: 4650, prev: 4500, unit: 'qtl' },
  { crop: 'Cotton', state: 'Gujarat', market: 'Rajkot', price: 6800, prev: 6900, unit: 'qtl' },
  { crop: 'Sugarcane', state: 'Uttar Pradesh', market: 'Meerut', price: 385, prev: 375, unit: 'qtl' },
  { crop: 'Turmeric', state: 'Telangana', market: 'Nizamabad', price: 9200, prev: 8800, unit: 'qtl' },
];

export default function MandiPage() {
  const now = typeof window !== 'undefined' ? new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'short',
  }) : 'Loading...';

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(245,245,240,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)', height: '4rem',
        display: 'flex', alignItems: 'center',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.3rem', color: 'var(--green-900)' }}>
            🌾 AgriConnect
          </Link>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href="/marketplace" className="btn btn-ghost btn-sm">Marketplace</Link>
            <Link href="/auth/consumer" className="btn btn-primary btn-sm">Sign In</Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div style={{ background: 'var(--green-900)', padding: '3rem 0', color: '#fff' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', marginBottom: '0.75rem' }}>
                📊 Live Mandi Prices
              </span>
              <h1 style={{ color: '#fff', fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 800, marginBottom: '0.5rem' }}>
                Today&apos;s APMC Rates
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                Updated: {now} IST
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', padding: '1rem 1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit,sans-serif' }}>18</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em' }}>States</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', padding: '1rem 1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit,sans-serif' }}>120+</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Crops</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
        {/* Info banner */}
        <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
          <span>ℹ️</span>
          <span>Prices shown are per quintal (100 kg) in INR. ▲ = higher than yesterday, ▼ = lower.</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <thead>
              <tr style={{ background: 'var(--bg-base)', borderBottom: '2px solid var(--border)' }}>
                {['Crop', 'State', 'Market', 'Price (₹/qtl)', 'Change', 'Trend'].map((h) => (
                  <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MANDI_DATA.map((row, i) => {
                const change = row.price - row.prev;
                const pct = ((change / row.prev) * 100).toFixed(1);
                const up = change >= 0;
                return (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={(e: React.MouseEvent<HTMLTableRowElement>) => (e.currentTarget.style.background = 'var(--bg-base)')}
                    onMouseLeave={(e: React.MouseEvent<HTMLTableRowElement>) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>{row.crop}</td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{row.state}</td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{row.market}</td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ fontWeight: 700, fontFamily: 'Outfit,sans-serif', fontSize: '1.05rem', color: 'var(--green-900)' }}>
                        ₹{row.price.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ color: up ? '#16A34A' : '#DC2626', fontWeight: 600, fontSize: '0.875rem' }}>
                        {up ? '▲' : '▼'} ₹{Math.abs(change)} ({up ? '+' : ''}{pct}%)
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className={`badge ${up ? 'badge-green' : 'badge-red'}`}>
                        {up ? 'Rising' : 'Falling'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* CTA */}
        <div style={{ marginTop: '3rem', textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.75rem' }}>
            Sell at the best price today
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            List your produce directly and let buyers come to you.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/farmer" className="btn btn-primary">🌾 List My Produce</Link>
            <Link href="/marketplace" className="btn btn-outline">🛒 Browse Marketplace</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
