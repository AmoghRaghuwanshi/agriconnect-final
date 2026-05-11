'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore } from '@/store/orderStore';
import { useCartStore } from '@/store/cartStore';
import DashboardNav from '@/components/shared/DashboardNav';

export default function ConsumerProfilePage() {
  const { user, isAuthenticated } = useAuthStore();
  const { orders } = useOrderStore();
  const { items: cartItems } = useCartStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/auth/consumer');
      return;
    }
    if (mounted && isAuthenticated && user?.role === 'CONSUMER') {
      useOrderStore.getState().fetchOrders({ buyerId: user.id });
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !user) return null;

  /* ── Live data from stores ────────────────────────────── */
  const myOrders = orders.filter(o => o.buyerId === user.id);
  const totalSpent = myOrders.filter(o => o.paymentStatus === 'PAID').reduce((s, o) => s + o.totalAmount, 0);
  const cartCount = cartItems.length;

  const stats = [
    { value: String(myOrders.length), label: 'Orders Placed', icon: '📦', href: '/orders' },
    { value: `₹${totalSpent.toLocaleString()}`, label: 'Total Spent', icon: '💰', href: '/orders' },
    { value: String(cartCount), label: 'Items in Cart', icon: '🛒', href: '/cart' },
  ];

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <DashboardNav />

      <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '900px', margin: '0 auto' }}>
        {/* Profile Header */}
        <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ width: '5rem', height: '5rem', borderRadius: '50%', background: 'var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', flexShrink: 0 }}>
            {user.avatar}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Welcome, {user.name}!</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.email} · {user.phone}</p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <Link href="/marketplace" className="btn btn-primary btn-sm">🛒 Shop Produce</Link>
              <Link href="/cart" className="btn btn-outline btn-sm">🛒 My Cart</Link>
              <Link href="/orders" className="btn btn-ghost btn-sm">📦 Orders</Link>
            </div>
          </div>
        </div>

        {/* Quick Stats — now clickable + live data */}
        <div className="bento bento-3" style={{ marginBottom: '2rem' }}>
          {stats.map(s => (
            <Link key={s.label} href={s.href} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="stat-card" style={{ textAlign: 'center', cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s' }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{s.icon}</div>
                <div className="stat-value" style={{ fontSize: '1.5rem' }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Orders — from real orderStore */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.15rem' }}>Recent Orders</h2>
            <Link href="/orders" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>View All →</Link>
          </div>
          {myOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📦</div>
              <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>No orders yet</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Place your first order from the marketplace!</div>
              <Link href="/marketplace" className="btn btn-primary btn-sm">Browse Marketplace</Link>
            </div>
          ) : (
            myOrders.slice(0, 5).map(o => (
              <Link key={o.id} href={`/orders/${o.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card-flat" style={{ padding: '1.25rem', marginBottom: '0.75rem', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)')}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.boxShadow = '')}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600 }}>{o.id}</span>
                    <span className={`badge ${o.orderStatus === 'PENDING' ? 'badge-amber' : o.orderStatus === 'DELIVERED' || o.orderStatus === 'COMPLETED' ? 'badge-green' : 'badge-blue'}`}>{o.orderStatus.replace(/_/g, ' ')}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    👨‍🌾 {o.farmerName} · {o.cropName} ({o.quantityKg} kg)
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span style={{ fontWeight: 700, color: 'var(--green-900)' }}>₹{o.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
