'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/store/authStore';

/* ── SVG icons (matching Stitch reference nav) ─────────────────────────── */
const Icons = {
  home: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  listings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M3 9h18"/>
      <path d="M9 21V9"/>
    </svg>
  ),
  orders: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  ),
  mandi: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 7V5a4 4 0 00-8 0v2"/>
      <path d="M12 12v3"/>
    </svg>
  ),
  profile: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  bell: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
  cart: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
    </svg>
  ),
  marketplace: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3h18v4H3z"/><path d="M4 7v13h16V7"/><path d="M9 7v6h6V7"/>
    </svg>
  ),
};

/* ── Nav link definitions per role ─────────────────────────────────────── */
interface NavItem { href: string; label: string; icon: keyof typeof Icons; }

const FARMER_LINKS: NavItem[] = [
  { href: '/farmer/dashboard', label: 'Home', icon: 'home' },
  { href: '/farmer/listings', label: 'Listings', icon: 'listings' },
  { href: '/farmer/orders', label: 'Orders', icon: 'orders' },
  { href: '/mandi', label: 'Mandi', icon: 'mandi' },
  { href: '/profile', label: 'Profile', icon: 'profile' },
];

const CONSUMER_LINKS: NavItem[] = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/marketplace', label: 'Shop', icon: 'marketplace' },
  { href: '/cart', label: 'Cart', icon: 'cart' },
  { href: '/orders', label: 'Orders', icon: 'orders' },
  { href: '/mandi', label: 'Mandi', icon: 'mandi' },
  { href: '/profile', label: 'Profile', icon: 'profile' },
];

const WHOLESALER_LINKS: NavItem[] = [
  { href: '/wholesaler/dashboard', label: 'Home', icon: 'home' },
  { href: '/wholesaler/browse', label: 'Browse', icon: 'marketplace' },
  { href: '/wholesaler/orders', label: 'Orders', icon: 'orders' },
  { href: '/profile', label: 'Profile', icon: 'profile' },
];

const ADMIN_LINKS: NavItem[] = [
  { href: '/admin/dashboard', label: 'Home', icon: 'home' },
  { href: '/admin/users', label: 'Users', icon: 'profile' },
  { href: '/admin/orders', label: 'Orders', icon: 'orders' },
  { href: '/admin/disputes', label: 'Disputes', icon: 'listings' },
];

function getLinksForRole(role: UserRole): NavItem[] {
  switch (role) {
    case 'FARMER': return FARMER_LINKS;
    case 'CONSUMER': return CONSUMER_LINKS;
    case 'WHOLESALER': return WHOLESALER_LINKS;
    case 'ADMIN': return ADMIN_LINKS;
    default: return [];
  }
}

/**
 * Shared dashboard nav for all authenticated portals.
 * Desktop: horizontal top bar with icon+text links (Stitch reference).
 * Mobile: slim top bar + bottom tab bar.
 */
export default function DashboardNav() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const links = getLinksForRole(user.role);

  const isActive = (href: string) => {
    if (href === '/' || href === '/farmer/dashboard' || href === '/wholesaler/dashboard' || href === '/admin/dashboard') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ── Desktop Top Nav ─────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(249,246,240,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        height: 'var(--nav-height)',
        display: 'flex', alignItems: 'center',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          {/* Logo */}
          <Link href="/" style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            fontWeight: 800, fontSize: '1.25rem', color: 'var(--green-900)',
            fontFamily: "var(--font-fraunces, 'Fraunces'), serif",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--green-900)" strokeWidth="2.5">
              <path d="M7 20l5-16 5 16"/><path d="M4 17c2-4 5-6 8-6s6 2 8 6"/>
            </svg>
            AgriConnect
          </Link>

          {/* Center nav links (desktop) */}
          <div className="hide-mobile" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
            {links.map(link => {
              const active = isActive(link.href);
              return (
                <Link key={link.href} href={link.href} style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.5rem 0.875rem', borderRadius: 'var(--radius-full)',
                  fontSize: '0.875rem', fontWeight: active ? 700 : 500,
                  color: active ? 'var(--green-900)' : 'var(--text-secondary)',
                  background: active ? 'var(--green-100)' : 'transparent',
                  transition: 'all 0.15s ease', textDecoration: 'none',
                }}>
                  {Icons[link.icon]}
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right — bell + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)', padding: '0.4rem',
              position: 'relative',
            }} aria-label="Notifications">
              {Icons.bell}
            </button>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ color: '#DC2626', fontSize: '0.8rem' }} id="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Bottom Tab Bar ──────────────────────────────────── */}
      <div className="show-mobile-only" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(10px)',
        borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        height: '3.75rem', padding: '0 0.5rem',
      }}>
        {links.map(link => {
          const active = isActive(link.href);
          return (
            <Link key={link.href} href={link.href} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '0.15rem', fontSize: '0.6rem', fontWeight: active ? 700 : 500,
              color: active ? 'var(--green-900)' : 'var(--text-muted)',
              textDecoration: 'none', padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              background: active ? 'var(--green-100)' : 'transparent',
              transition: 'all 0.15s',
              minWidth: '3.5rem',
            }}>
              {Icons[link.icon]}
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
