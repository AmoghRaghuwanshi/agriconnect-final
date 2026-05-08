'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useListingStore, type Listing } from '@/store/listingStore';
import DashboardNav from '@/components/shared/DashboardNav';

type FilterTab = 'ALL' | 'ACTIVE' | 'PAUSED' | 'EXPIRED';

export default function FarmerListingsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { listings, pauseListing, resumeListing, deleteListing } = useListingStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<FilterTab>('ALL');

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'FARMER')) router.push('/auth/farmer');
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !user) return null;

  const myListings = listings.filter(l => l.farmerId === user.id);
  const filtered = tab === 'ALL' ? myListings : myListings.filter(l => l.status === tab);
  const counts = { ALL: myListings.length, ACTIVE: myListings.filter(l => l.status === 'ACTIVE').length, PAUSED: myListings.filter(l => l.status === 'PAUSED').length, EXPIRED: myListings.filter(l => l.status === 'EXPIRED').length };

  const statusBadge = (s: string) => s === 'ACTIVE' ? 'badge-green' : s === 'PAUSED' ? 'badge-amber' : 'badge-gray';
  const cropEmoji = (c: string) => c.includes('Wheat') ? '🌾' : c.includes('Rice') ? '🍚' : c.includes('Onion') ? '🧅' : c.includes('Tomato') ? '🍅' : c.includes('Potato') ? '🥔' : c.includes('Chili') ? '🌶️' : c.includes('Maize') ? '🌽' : c.includes('Turmeric') ? '🟡' : '🌱';

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <DashboardNav />
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>My Listings</h1>
          <Link href="/farmer/listings/new" className="btn btn-primary" id="new-listing-btn">+ New Listing</Link>
        </div>

        {/* Filter tabs */}
        <div className="tabs" style={{ marginBottom: '1.5rem' }}>
          {(['ALL', 'ACTIVE', 'PAUSED', 'EXPIRED'] as FilterTab[]).map(t => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()} ({counts[t]})
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ fontSize: '3rem' }}>🌾</div>
            <div className="empty-state-title">No listings {tab !== 'ALL' ? `with status "${tab.toLowerCase()}"` : 'yet'}</div>
            <div className="empty-state-text">Bechne ke liye listing banao!</div>
            <Link href="/farmer/listings/new" className="btn btn-primary" style={{ marginTop: '1rem' }}>Create Listing</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map(l => (
              <div key={l.id} className="card-flat" style={{ padding: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                <div style={{ width: '4rem', height: '4rem', borderRadius: 'var(--radius-md)', background: 'var(--green-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>
                  {cropEmoji(l.cropName)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>{l.cropName}</span>
                    {l.variety && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({l.variety})</span>}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {l.quantityRemaining} kg left · ₹{l.pricePerKg}/kg
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {l.views} views · Expires {new Date(l.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <span className={`badge ${statusBadge(l.status)}`}>{l.status}</span>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    {l.status === 'ACTIVE' && (
                      <button className="btn btn-ghost btn-sm" onClick={() => pauseListing(l.id)}>⏸ Pause</button>
                    )}
                    {l.status === 'PAUSED' && (
                      <button className="btn btn-ghost btn-sm" onClick={() => resumeListing(l.id)}>▶ Resume</button>
                    )}
                    <Link href={`/farmer/listings/${l.id}/edit`} className="btn btn-ghost btn-sm">✏️ Edit</Link>
                    {l.status !== 'EXPIRED' && (
                      <button className="btn btn-ghost btn-sm" style={{ color: '#DC2626' }}
                        onClick={() => { if (confirm(`Delete listing "${l.cropName}"?`)) deleteListing(l.id); }}>
                        🗑
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
