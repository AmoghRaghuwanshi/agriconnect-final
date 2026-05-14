'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { BarChart3, Users, Wheat, Building2, Package, Scale, TrendingUp, LineChart, Bell, Settings, Loader2, LogOut, Shield } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

const NAV_ITEMS: { href: string; Icon: LucideIcon; label: string }[] = [
  { href: '/admin/dashboard', Icon: BarChart3, label: 'Dashboard' },
  { href: '/admin/users', Icon: Users, label: 'Users' },
  { href: '/admin/farmers', Icon: Wheat, label: 'Farmers' },
  { href: '/admin/wholesalers', Icon: Building2, label: 'Wholesalers' },
  { href: '/admin/orders', Icon: Package, label: 'Orders' },
  { href: '/admin/support', Icon: Scale, label: 'Disputes' },
  { href: '/admin/mandi', Icon: TrendingUp, label: 'Mandi' },
  { href: '/admin/analytics', Icon: LineChart, label: 'Analytics' },
  { href: '/admin/notifications', Icon: Bell, label: 'Notifications' },
  { href: '/admin/settings', Icon: Settings, label: 'Settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'ADMIN')) {
      router.push('/auth/admin');
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={32} className="animate-spin" style={{ marginBottom: '0.75rem', color: '#6366f1' }} />
          <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Loading admin panel…</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    useAuthStore.getState().logout();
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5fffe' }}>
      {/* Sidebar */}
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
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '0.5rem 0.75rem 1rem', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'white' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}><Wheat size={20} /> AgriConnect</h2>
          </Link>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.6 }}>Admin Panel</span>
        </div>

        {/* Nav links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.7rem 1rem',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.75)',
                  textDecoration: 'none',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <item.Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info + Logout */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '1rem', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
              <Shield size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>{user.name}</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.6, color: 'white' }}>{user.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.6rem',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'rgba(255,255,255,0.8)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <LogOut size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', minHeight: '100vh' }}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
    </div>
  );
}
