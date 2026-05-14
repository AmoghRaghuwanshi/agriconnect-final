'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface MandiRecord {
  crop: string;
  state: string;
  market: string;
  price: number;
  prev: number;
  emoji: string;
  category: string;
}

const STATES = [
  { label: 'All States', value: 'All States' },
  { label: 'MP', value: 'Madhya Pradesh' },
  { label: 'Maharashtra', value: 'Maharashtra' },
  { label: 'UP', value: 'Uttar Pradesh' },
  { label: 'Punjab', value: 'Punjab' },
  { label: 'Karnataka', value: 'Karnataka' },
  { label: 'Bihar', value: 'Bihar' },
  { label: 'Gujarat', value: 'Gujarat' },
  { label: 'AP', value: 'Andhra Pradesh' },
  { label: 'Rajasthan', value: 'Rajasthan' }
];

export default function MandiPage() {
  const [data, setData] = useState<MandiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState('');
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('All States');

  useEffect(() => {
    setNow(new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' }));
    fetchMandiData();
  }, []);

  const fetchMandiData = async () => {
    try {
      const res = await fetch('/api/mandi');
      const json = await res.json();
      setData(json.records);
    } catch (err) {
      console.error('Failed to fetch mandi data', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return data.filter(row => {
      const matchSearch = !search || row.crop.toLowerCase().includes(search.toLowerCase());
      const matchState = stateFilter === 'All States' || row.state === stateFilter;
      return matchSearch && matchState;
    });
  }, [data, search, stateFilter]);

  // Market Intelligence Logic
  const insights = useMemo(() => {
    if (filtered.length < 2) return null;
    
    const sorted = [...filtered].sort((a, b) => a.price - b.price);
    const cheapest = sorted[0];
    const expensive = sorted[sorted.length - 1];
    
    // Only show if there's a significant difference
    if (expensive.price === cheapest.price) return null;

    return {
      bestToBuy: cheapest,
      bestToSell: expensive,
      difference: expensive.price - cheapest.price,
      cropName: cheapest.crop.split('(')[0].trim()
    };
  }, [filtered]);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(245,245,240,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', height: '4rem', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: 'var(--font-fraunces), Fraunces, serif', fontWeight: 700, fontSize: '1.3rem', color: 'var(--green-900)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>🌾 AgriConnect</Link>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href="/marketplace" className="btn btn-ghost btn-sm">Marketplace</Link>
            <Link href="/auth/consumer" className="btn btn-primary btn-sm">Sign In</Link>
          </div>
        </div>
      </nav>

      {/* AI Suggestion Banner */}
      <div style={{ background: 'var(--green-900)', padding: '0.875rem 0', color: '#fff' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
          <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '6px', padding: '0.3rem 0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>✨ AI</span>
          <span>Based on your pincode (461001): Best price for <strong>Wheat</strong> is in <strong>Mandsaur</strong> — ₹2,200/quintal</span>
        </div>
      </div>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--green-900), var(--green-800))', padding: '3rem 0', color: '#fff' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', marginBottom: '0.75rem', display: 'inline-block' }}>📊 Live Mandi Prices</span>
              <h1 style={{ color: '#fff', fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 800, marginBottom: '0.5rem' }}>आज के मंडी भाव</h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Today&apos;s APMC Rates · Updated: {now} IST</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', padding: '1rem 1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{loading ? '...' : Array.from(new Set(data.map(d => d.state))).length}</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em' }}>States</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', padding: '1rem 1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{loading ? '...' : data.length}</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Markets</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        
        {/* Market Insights Card */}
        {insights && !search && (
          <div style={{ 
            background: 'linear-gradient(to right, #fdfbf7, #fff)', 
            borderRadius: '16px', 
            padding: '1.5rem', 
            marginBottom: '2rem', 
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ background: 'var(--green-50)', color: 'var(--green-900)', width: '3.5rem', height: '3.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>💡</div>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--green-900)' }}>Market Intelligence for {insights.cropName}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ borderLeft: '3px solid #16a34a', paddingLeft: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Best Place to Sell</div>
                  <div style={{ fontWeight: 700 }}>{insights.bestToSell.market}, {insights.bestToSell.state}</div>
                  <div style={{ color: '#16a34a', fontWeight: 800 }}>₹{insights.bestToSell.price} <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>(+₹{insights.difference} more)</span></div>
                </div>
                <div style={{ borderLeft: '3px solid #3b82f6', paddingLeft: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Best Place to Buy</div>
                  <div style={{ fontWeight: 700 }}>{insights.bestToBuy.market}, {insights.bestToBuy.state}</div>
                  <div style={{ color: '#3b82f6', fontWeight: 800 }}>₹{insights.bestToBuy.price} <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>(Save ₹{insights.difference})</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search + Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#9BA3A5" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} aria-hidden="true"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            <input className="input" placeholder="Search crop name (e.g. Wheat)..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '2.75rem' }} />
          </div>
        </div>

        {/* State chips */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {STATES.map(s => (
            <button key={s.value} onClick={() => setStateFilter(s.value)}
              style={{
                padding: '0.4rem 0.9rem', borderRadius: '9999px', border: 'none',
                fontSize: '0.8rem', fontWeight: stateFilter === s.value ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap',
                background: stateFilter === s.value ? 'var(--green-900)' : 'var(--bg-card)',
                color: stateFilter === s.value ? '#fff' : 'var(--text-secondary)',
                boxShadow: stateFilter === s.value ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
                transition: 'all 0.15s',
              }}>{s.label}</button>
          ))}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--bg-card)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <thead>
              <tr style={{ background: 'var(--bg-base)', borderBottom: '2px solid var(--border)' }}>
                {['', 'Crop', 'State', 'Market', 'Price (₹/qtl)', 'Change', 'Trend'].map(h => (
                  <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Fetching live data...</td></tr>
              ) : filtered.map((row, i) => {
                const change = row.price - row.prev;
                const pct = ((change / row.prev) * 100).toFixed(1);
                const up = change >= 0;
                return (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? '#fff' : '#F9F6F0', transition: 'background 0.15s' }}>
                    <td style={{ padding: '0.875rem 0.5rem 0.875rem 1rem', fontSize: '1.4rem', width: '2.5rem' }}>{row.emoji}</td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{row.crop}</td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{row.state}</td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{row.market}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ fontWeight: 700, fontFamily: 'Outfit,sans-serif', fontSize: '1.05rem', color: 'var(--green-900)' }}>₹{row.price.toLocaleString('en-IN')}</span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ color: up ? '#16A34A' : '#DC2626', fontWeight: 600, fontSize: '0.85rem' }}>
                        {up ? '▲' : '▼'} ₹{Math.abs(change)} ({up ? '+' : ''}{pct}%)
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ display: 'inline-flex', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, background: up ? '#D1FAE5' : '#FEE2E2', color: up ? '#065F46' : '#991B1B' }}>
                        {up ? 'Rising' : 'Falling'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔍</div>
            <p>No crops found matching &ldquo;{search}&rdquo;</p>
          </div>
        )}

        {/* CTA */}
        <div style={{ marginTop: '3rem', textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.75rem' }}>Sell at the best price today</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>List your produce directly and let buyers come to you.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/farmer" className="btn btn-primary">🌾 List My Produce</Link>
            <Link href="/marketplace" className="btn btn-outline">🛒 Browse Marketplace</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
