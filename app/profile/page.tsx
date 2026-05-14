'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import DashboardNav from '@/components/shared/DashboardNav';
import { ShoppingCart, Package, User, IndianRupee } from 'lucide-react';

export default function ConsumerProfilePage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/auth/consumer');
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !user) return null;

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
              <Link href="/marketplace" className="btn btn-primary btn-sm"><ShoppingCart size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} /> Shop Produce</Link>
              <Link href="/cart" className="btn btn-outline btn-sm"><ShoppingCart size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} /> My Cart</Link>
              <Link href="/orders" className="btn btn-ghost btn-sm"><Package size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} /> Orders</Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bento bento-3" style={{ marginBottom: '2rem' }}>
          {[
            { value: '3', label: 'Orders Placed' },
            { value: '₹2,800', label: 'Total Spent' },
            { value: '2', label: 'Items in Cart' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ textAlign: 'center' }}>
              <div className="stat-value" style={{ fontSize: '1.5rem' }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.15rem', marginBottom: '1.25rem' }}>Recent Orders</h2>
          {[
            { id: 'ORD-2041', farmer: 'Raju Patel', crop: 'Wheat (Lokwan)', qty: 25, total: 700, status: 'Pending', date: '7 May 2026' },
            { id: 'ORD-2039', farmer: 'Suresh Kumar', crop: 'Fresh Tomatoes', qty: 10, total: 150, status: 'Delivered', date: '4 May 2026' },
            { id: 'ORD-2036', farmer: 'Venkat Rao', crop: 'Green Chili', qty: 5, total: 225, status: 'Delivered', date: '1 May 2026' },
          ].map(o => (
            <div key={o.id} className="card-flat" style={{ padding: '1.25rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>{o.id}</span>
                <span className={`badge ${o.status === 'Pending' ? 'badge-amber' : 'badge-green'}`}>{o.status}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <User size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} /> {o.farmer} · {o.crop} ({o.qty} kg)
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{o.date}</span>
                <span style={{ fontWeight: 700, color: 'var(--green-900)' }}>₹{o.total.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
