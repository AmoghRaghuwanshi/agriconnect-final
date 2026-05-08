'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/store/authStore';

/**
 * Shared dashboard nav for all authenticated portals.
 * Shows user info, role badge, and logout button.
 */
export default function DashboardNav() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const roleColors: Record<UserRole, { bg: string; text: string; label: string }> = {
    FARMER: { bg: 'var(--green-100)', text: 'var(--green-900)', label: 'Farmer' },
    CONSUMER: { bg: 'var(--green-100)', text: 'var(--green-900)', label: 'Consumer' },
    WHOLESALER: { bg: '#DBEAFE', text: '#1E40AF', label: 'Wholesaler' },
    ADMIN: { bg: '#EDE9FE', text: '#5B21B6', label: 'Admin' },
  };

  const rc = roleColors[user.role];

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)', height: '4rem',
      display: 'flex', alignItems: 'center',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.3rem', color: 'var(--green-900)' }}>
            🌾 AgriConnect
          </Link>
          <span style={{ padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 700, background: rc.bg, color: rc.text, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {rc.label}
          </span>
        </div>

        {/* Center links */}
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          {user.role === 'FARMER' && (
            <>
              <Link href="/farmer/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
              <Link href="/farmer/listings" className="btn btn-ghost btn-sm">My Listings</Link>
              <Link href="/farmer/orders" className="btn btn-ghost btn-sm">Orders</Link>
            </>
          )}
          {user.role === 'CONSUMER' && (
            <>
              <Link href="/marketplace" className="btn btn-ghost btn-sm">Marketplace</Link>
              <Link href="/cart" className="btn btn-ghost btn-sm">🛒 Cart</Link>
              <Link href="/orders" className="btn btn-ghost btn-sm">Orders</Link>
            </>
          )}
          {user.role === 'WHOLESALER' && (
            <>
              <Link href="/wholesaler/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
              <Link href="/wholesaler/rfq" className="btn btn-ghost btn-sm">RFQ</Link>
              <Link href="/wholesaler/orders" className="btn btn-ghost btn-sm">Orders</Link>
            </>
          )}
          {user.role === 'ADMIN' && (
            <>
              <Link href="/admin/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
              <Link href="/admin/users" className="btn btn-ghost btn-sm">Users</Link>
              <Link href="/admin/disputes" className="btn btn-ghost btn-sm">Disputes</Link>
            </>
          )}
        </div>

        {/* Right — user info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.avatar} {user.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user.email}</div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ color: '#DC2626' }} id="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
