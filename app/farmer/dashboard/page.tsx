'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useListingStore } from '@/store/listingStore';
import { useOrderStore } from '@/store/orderStore';
import DashboardNav from '@/components/shared/DashboardNav';
import MicFAB from '@/components/farmer/MicFAB';
import VoiceTutorial from '@/components/farmer/VoiceTutorial';

/* ── Inline SVG icons for stat cards (matching Stitch) ─────────────────── */
const StatIcon = ({ type }: { type: string }) => {
  const style: React.CSSProperties = { width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' };
  switch (type) {
    case 'revenue': return <div style={{ ...style, background: 'var(--green-100)', color: 'var(--green-900)' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/></svg></div>;
    case 'listings': return <div style={{ ...style, background: 'var(--green-100)', color: 'var(--green-900)' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg></div>;
    case 'orders': return <div style={{ ...style, background: 'var(--terra-100)', color: 'var(--terra-600)' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg></div>;
    case 'views': return <div style={{ ...style, background: 'var(--olive-100)', color: 'var(--olive-700)' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></div>;
    default: return null;
  }
};

export default function FarmerDashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { listings } = useListingStore();
  const { orders } = useOrderStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'FARMER')) {
      router.push('/auth/farmer');
      return;
    }
    if (mounted && isAuthenticated && user?.role === 'FARMER') {
      useListingStore.getState().fetchListings();
      useOrderStore.getState().fetchOrders({ farmerId: user.id });
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !user) return null;

  const myListings = listings.filter(l => l.farmerId === user.id);
  const activeListings = myListings.filter(l => l.status === 'ACTIVE');
  const myOrders = orders.filter(o => o.farmerId === user.id);
  const pendingOrders = myOrders.filter(o => o.orderStatus === 'PENDING');
  const completedOrders = myOrders.filter(o => o.orderStatus === 'COMPLETED' || o.orderStatus === 'DELIVERED');
  const totalRevenue = completedOrders.reduce((s, o) => s + o.totalAmount, 0);
  const totalViews = activeListings.reduce((s, l) => s + (l.views || 0), 0);

  const today = new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingBottom: '5rem' }}>
      <DashboardNav />
      <div className="container" style={{ padding: '1.75rem 1.5rem' }}>

        {/* ── Greeting Card (Stitch: bg card, greeting + mic) ──────── */}
        <div className="card" style={{
          padding: '2rem', marginBottom: '1.5rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
        }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem', lineHeight: 1.2 }}>
              नमस्ते, {user.name}. 🌾
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {today} · {user.farmName} · Score: <strong style={{ color: 'var(--green-900)' }}>{user.accuracy}%</strong>
            </p>
          </div>
          <Link href="/farmer/listings/new" aria-label="Voice listing" style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'var(--green-900)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, textDecoration: 'none',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          </Link>
        </div>

        {/* ── Stats Row (Stitch: 4 white cards with icons) ─────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem', marginBottom: '2rem',
        }}>
          {[
            { value: `₹${totalRevenue.toLocaleString()}`, label: 'Total Revenue', hindi: 'कुल आमदनी', icon: 'revenue' as const, sub: totalRevenue > 0 ? '📈 +12% this month' : undefined, subColor: 'var(--green-700)', href: '/farmer/income' },
            { value: String(activeListings.length), label: 'Active Listings', hindi: 'सक्रिय लिस्टिंग', icon: 'listings' as const, sub: myListings.length > activeListings.length ? `${myListings.length - activeListings.length} sold out` : undefined, subColor: 'var(--text-muted)', href: '/farmer/listings' },
            { value: String(pendingOrders.length), label: 'New Orders', hindi: 'नए ऑर्डर', icon: 'orders' as const, sub: pendingOrders.length > 0 ? `⚡ ${pendingOrders.length} require action` : undefined, subColor: '#B45309', href: '/farmer/orders' },
            { value: String(totalViews), label: 'Profile Views', hindi: 'प्रोफाइल व्यूज', icon: 'views' as const, sub: totalViews > 0 ? '📈 +5% this week' : undefined, subColor: 'var(--green-700)', href: '/farmer/score' },
          ].map(s => (
            <Link key={s.label} href={s.href} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card" style={{ padding: '1.25rem 1.5rem', cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s' }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{s.label}</span>
                  <StatIcon type={s.icon} />
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, fontFamily: "var(--font-outfit, 'Outfit'), sans-serif" }}>{s.value}</div>
                {s.sub && <div style={{ fontSize: '0.75rem', color: s.subColor, marginTop: '0.5rem', fontWeight: 500 }}>{s.sub}</div>}
              </div>
            </Link>
          ))}
        </div>

        {/* ── Content grid: Listings + Mandi ───────────────────────── */}
        <div className="grid-sidebar">
          {/* Your Active Listings */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Your Active Listings</h2>
              <Link href="/farmer/listings" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>View All →</Link>
            </div>
            {activeListings.length === 0 ? (
              <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🌾</div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>No listings yet</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>अभी कोई लिस्टिंग नहीं — बोलकर जोड़ें</div>
                <Link href="/farmer/listings/new" className="btn btn-primary">+ नई Listing</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {activeListings.slice(0, 4).map(l => (
                  <Link key={l.id} href={`/farmer/listings/${l.id}/edit`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
                      {/* Image placeholder */}
                      <div style={{
                        height: 140, background: 'linear-gradient(135deg, var(--green-100), var(--olive-100))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative', fontSize: '2.5rem',
                      }}>
                        {l.cropName.toLowerCase().includes('wheat') ? '🌾' :
                         l.cropName.toLowerCase().includes('tomato') ? '🍅' :
                         l.cropName.toLowerCase().includes('onion') ? '🧅' :
                         l.cropName.toLowerCase().includes('potato') ? '🥔' :
                         l.cropName.toLowerCase().includes('rice') ? '🌾' : '🌿'}
                        <span className="badge badge-green" style={{ position: 'absolute', top: 10, right: 10 }}>Active</span>
                      </div>
                      <div style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{l.cropName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{l.variety || 'Standard'} · {l.organic ? 'Organic' : 'Conventional'}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--green-900)' }}>₹{l.pricePerKg} / kg</div>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)',
                        }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Available: {l.quantityRemaining} kg</span>
                          <span className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}>Edit</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Local Mandi Prices */}
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Local Mandi Prices</h2>
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{
                padding: '0.75rem 1.25rem', background: 'var(--bg-muted)',
                borderBottom: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: '0.8rem', fontWeight: 600,
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>Nearest Mandi</span>
                <span style={{ color: 'var(--text-muted)' }}>Today</span>
              </div>
              {[
                { crop: 'Wheat (गेहूं)', variety: 'Sharbati', price: '₹22/kg', delta: '+₹1', up: true },
                { crop: 'Tomato (टमाटर)', variety: 'Desi', price: '₹45/kg', delta: '-₹5', up: false },
                { crop: 'Onion (प्याज)', variety: 'Red', price: '₹25/kg', delta: '-₹2', up: false },
                { crop: 'Potato (आलू)', variety: 'White', price: '₹18/kg', delta: '—', up: true },
              ].map((m, i) => (
                <div key={i} style={{
                  padding: '0.875rem 1.25rem',
                  borderBottom: i < 3 ? '1px solid var(--border)' : 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.crop}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.variety}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{m.price}</div>
                    <div style={{ fontSize: '0.75rem', color: m.up ? 'var(--green-700)' : '#C1121F', fontWeight: 500 }}>{m.delta}</div>
                  </div>
                </div>
              ))}
              <Link href="/mandi" style={{
                display: 'block', textAlign: 'center', padding: '0.75rem',
                borderTop: '1px solid var(--border)', fontSize: '0.85rem',
                color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500,
              }}>
                View Full Mandi Report →
              </Link>
            </div>
          </div>
        </div>

        {/* ── Recent Orders ───────────────────────────────────────── */}
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Recent Orders</h2>
            <Link href="/farmer/orders" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>View All →</Link>
          </div>
          {myOrders.length === 0 ? (
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📦</div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>No orders yet</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Listings active hain — jald hi orders aayenge!</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {myOrders.slice(0, 3).map(o => (
                <Link key={o.id} href={`/farmer/orders/${o.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>#{o.id}</span>
                      <span className={`badge ${o.orderStatus === 'PENDING' ? 'badge-amber' : o.orderStatus === 'COMPLETED' || o.orderStatus === 'DELIVERED' ? 'badge-green' : 'badge-blue'}`}>
                        {o.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                    {/* Buyer info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 700, color: 'var(--green-900)',
                      }}>
                        {o.buyerName.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{o.buyerName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    {/* Item */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderTop: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{o.cropName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.quantityKg} kg</div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--green-900)' }}>₹{o.totalAmount.toLocaleString()}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Voice Agent */}
      <MicFAB />
      <VoiceTutorial />
    </main>
  );
}
