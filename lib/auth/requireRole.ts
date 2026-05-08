'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, type UserRole } from '@/store/authStore';

/**
 * Hook: useRequireRole
 * 
 * Provides consistent client-side route protection across all portal pages.
 * Returns { ready, user } — `ready` is false until mount + auth check passes.
 * 
 * Usage:
 *   const { ready, user } = useRequireRole('FARMER', '/auth/farmer');
 *   if (!ready) return null;
 *   // user is guaranteed to be non-null and have the correct role
 */
export function useRequireRole(
  requiredRole: UserRole | UserRole[],
  redirectTo: string
) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated || !user) {
      router.push(redirectTo);
      return;
    }

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
      router.push(redirectTo);
    }
  }, [mounted, isAuthenticated, user, requiredRole, redirectTo, router]);

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  const ready = mounted && isAuthenticated && user !== null && roles.includes(user.role);

  return {
    ready,
    user: ready ? user! : null,
  };
}

/**
 * Hook: useRequireAuth
 * 
 * Lighter variant — just requires authenticated user (any role).
 * Used for consumer pages that don't need a specific role.
 */
export function useRequireAuth(redirectTo: string = '/auth/consumer') {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [mounted, isAuthenticated, redirectTo, router]);

  const ready = mounted && isAuthenticated && user !== null;

  return {
    ready,
    user: ready ? user! : null,
  };
}
