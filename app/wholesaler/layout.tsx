'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { WholesalerProviders } from './providers';

const NAV_ITEMS = [
  { href: '/wholesaler/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/wholesaler/browse', icon: '🔍', label: 'Browse' },
  { href: '/wholesaler/orders', icon: '📦', label: 'Orders' },
  { href: '/wholesaler/rfq', icon: '💬', label: 'RFQ' },
  { href: '/wholesaler/standing-orders', icon: '🔄', label: 'Standing Orders' },
  { href: '/wholesaler/credit', icon: '💳', label: 'Credit' },
  { href: '/wholesaler/invoices', icon: '📄', label: 'Invoices' },
  { href: '/wholesaler/favourites', icon: '⭐', label: 'Favourites' },
  { href: '/wholesaler/profile', icon: '👤', label: 'Profile' },
  { href: '/wholesaler/settings', icon: '⚙️', label: 'Settings' },
];

export default function WholesalerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'WHOLESALER')) {
      router.push('/auth/wholesaler');
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !isAuthenticated || user?.role !== 'WHOLESALER') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', animation: 'pulse 1.5s infinite' }}>🏭</div>
          <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Loading wholesaler portal…</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => { logout(); router.push('/'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5fffe' }}>
      <aside style={{
        width: '260px',
        background: 'linear-gradient(180deg, #0c1f3f 0%, #1a2e5a 100%)',
        color: 'white',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '0.5rem 0.75rem 1rem', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'white' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'white' }}>🌾 AgriConnect</h2>
          </Link>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.5 }}>B2B Portal</span>
        </div>

        {/* Nav links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/wholesaler/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.7rem 1rem',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                  textDecoration: 'none',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: '1.05rem' }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info + Logout */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '1rem', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>{user.avatar}</div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>{user.businessName ?? user.name}</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.5, color: 'white' }}>{user.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.6rem',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>
      <WholesalerProviders>
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>{children}</main>
      </WholesalerProviders>
    </div>
  );
}
