'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useListingStore } from '@/store/listingStore';
import { useOrderStore } from '@/store/orderStore';
import DashboardNav from '@/components/shared/DashboardNav';

export default function FarmerDashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { listings } = useListingStore();
  const { orders } = useOrderStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'FARMER')) router.push('/auth/farmer');
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !user) return null;

  const myListings = listings.filter(l => l.farmerId === user.id);
  const activeListings = myListings.filter(l => l.status === 'ACTIVE');
  const myOrders = orders.filter(o => o.farmerId === user.id);
  const pendingOrders = myOrders.filter(o => o.orderStatus === 'PENDING');
  const completedOrders = myOrders.filter(o => o.orderStatus === 'COMPLETED' || o.orderStatus === 'DELIVERED');
  const totalRevenue = completedOrders.reduce((s, o) => s + o.totalAmount, 0);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <DashboardNav />
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            नमस्ते, {user.name} जी! 🙏
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>{user.farmName} · Score: <strong style={{ color: 'var(--green-900)' }}>{user.accuracy}%</strong></p>
        </div>

        {/* Score Card */}
        <Link href="/farmer/score" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
            onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
            onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.boxShadow = 'none')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Your Score</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--green-900)' }}>{user.accuracy}/100 ⭐</div>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>View Details →</span>
            </div>
          </div>
        </Link>

        {/* Stats */}
        <div className="bento bento-4" style={{ marginBottom: '2rem' }}>
          {[
            { value: String(activeListings.length), label: 'Active Listings', color: 'var(--green-900)' },
            { value: `₹${totalRevenue.toLocaleString()}`, label: 'Total Revenue', color: 'var(--green-800)' },
            { value: String(pendingOrders.length), label: 'New Orders ⚡', color: '#B45309' },
            { value: String(myOrders.length), label: 'Total Orders', color: 'var(--olive-700)' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          <Link href="/farmer/listings/new" className="btn btn-primary" id="new-listing-btn">➕ New Listing</Link>
          <Link href="/farmer/listings" className="btn btn-outline">📋 My Listings</Link>
          <Link href="/farmer/income" className="btn btn-outline">💰 Income</Link>
          <Link href="/mandi" className="btn btn-ghost">📊 Mandi Prices</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
          {/* My Listings */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.15rem' }}>My Listings</h2>
              <Link href="/farmer/listings" className="btn btn-ghost btn-sm">View All →</Link>
            </div>
            {activeListings.length === 0 ? (
              <div className="card-flat" style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌾</div>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>No listings yet!</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>🎤 Say: "100 kilo gehun, 21 rupye kilo"</div>
                <Link href="/farmer/listings/new" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>+ Create First Listing</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {activeListings.slice(0, 3).map(l => (
                  <Link key={l.id} href={`/farmer/listings/${l.id}/edit`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card-flat" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{l.cropName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{l.quantityRemaining} kg · ₹{l.pricePerKg}/kg</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="badge badge-green">Active</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{l.views} views</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.15rem' }}>Recent Orders</h2>
              <Link href="/farmer/orders" className="btn btn-ghost btn-sm">View All →</Link>
            </div>
            {myOrders.length === 0 ? (
              <div className="card-flat" style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
                <div style={{ fontWeight: 600 }}>No orders yet</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Aapki listings active hain — jald hi orders aayenge!</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {myOrders.slice(0, 3).map(o => (
                  <Link key={o.id} href={`/farmer/orders/${o.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card-flat" style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{o.id}</span>
                        <span className={`badge ${o.orderStatus === 'PENDING' ? 'badge-amber' : o.orderStatus === 'COMPLETED' ? 'badge-green' : 'badge-blue'}`}>
                          {o.orderStatus.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{o.buyerName} · {o.cropName} ({o.quantityKg} kg)</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        <span style={{ fontWeight: 700, color: 'var(--green-900)' }}>₹{o.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
