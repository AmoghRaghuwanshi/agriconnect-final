'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { Wheat, LayoutDashboard, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import styles from './Header.module.css';

/**
 * Unified Header — Used on Landing Page and all public pages.
 * Detects auth state and shows either login buttons or dashboard link.
 * Consumer view has an animated cart badge.
 */
export default function Header() {
  const { user, isAuthenticated } = useAuthStore();
  const { items: cartItems } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [cartBump, setCartBump] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Animate cart badge on item count change
  useEffect(() => {
    if (mounted && cartItems.length > 0) {
      setCartBump(true);
      const t = setTimeout(() => setCartBump(false), 300);
      return () => clearTimeout(t);
    }
  }, [cartItems.length, mounted]);

  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'FARMER': return '/farmer';
      case 'CONSUMER': return '/marketplace';
      case 'WHOLESALER': return '/wholesaler/dashboard';
      case 'ADMIN': return '/admin/dashboard';
      default: return '/';
    }
  };

  const cartCount = mounted ? cartItems.length : 0;

  return (
    <nav className={styles.header}>
      <div className="container flex items-center justify-between" style={{ width: '100%' }}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <Wheat size={24} /> AgriConnect
        </Link>

        {/* Links */}
        <div className={styles.nav}>
          <Link href="/mandi" className={styles.navLink}>Mandi Prices</Link>
          <Link href="/marketplace" className={styles.navLink}>Marketplace</Link>

          {/* Cart icon with animated badge */}
          {(user?.role === 'CONSUMER' || !isAuthenticated) && (
            <Link href="/cart" className={styles.cartLink}>
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span
                  className={`${styles.cartBadge} ${cartBump ? 'animate-count-bump' : ''}`}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          <div className={styles.verticalDivider} />

          {isAuthenticated ? (
            <Link href={getDashboardPath()} className="btn btn-primary btn-sm">
              <LayoutDashboard size={16} /> My Dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth/consumer" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link href="/auth/consumer/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
