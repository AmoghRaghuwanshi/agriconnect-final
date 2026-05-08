import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

/**
 * Route protection middleware for all 5 portals.
 * Checks session and user role before granting access.
 * Passes through if Supabase is not yet configured (placeholder values).
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // ── Skip auth checks if Supabase is not configured yet ───────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const isConfigured =
    supabaseUrl.length > 0 &&
    !supabaseUrl.includes('placeholder') &&
    supabaseUrl.startsWith('https://');

  if (!isConfigured) {
    return res; // pass through — dev mode without real Supabase
  }

  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // ── Public paths — always allowed ────────────────────────────────────────
  const publicPaths = [
    '/',
    '/mandi',
    '/marketplace',
    '/legal',
    '/account-deactivated',
    '/auth/consumer',
    '/auth/consumer/register',
    '/auth/consumer/onboard',
    '/auth/consumer/forgot-password',
    '/auth/consumer/reset-password',
    '/auth/farmer',
    '/auth/farmer/otp',
    '/auth/wholesaler',
    '/auth/wholesaler/register',
    '/auth/admin',
    '/api/auth',
  ];

  const isPublic =
    publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/')) ||
    pathname.startsWith('/marketplace/') || // product listings are public
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/auth/') ||
    pathname.includes('.');

  if (isPublic) {
    return res;
  }

  // ── Not authenticated → redirect to appropriate login ─────────────────────
  if (!session) {
    if (pathname.startsWith('/farmer')) {
      return NextResponse.redirect(new URL('/auth/farmer', req.url));
    }
    if (pathname.startsWith('/wholesaler')) {
      return NextResponse.redirect(new URL('/auth/wholesaler', req.url));
    }
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/auth/admin', req.url));
    }
    // Consumer paths
    if (
      pathname.startsWith('/cart') ||
      pathname.startsWith('/checkout') ||
      pathname.startsWith('/orders') ||
      pathname.startsWith('/profile')
    ) {
      return NextResponse.redirect(
        new URL(`/auth/consumer?next=${encodeURIComponent(pathname)}`, req.url)
      );
    }
    return NextResponse.redirect(new URL('/auth/consumer', req.url));
  }

  // ── Get user role ─────────────────────────────────────────────────────────
  const { data: user } = await supabase
    .from('users')
    .select('role, is_active')
    .eq('id', session.user.id)
    .single();

  // Soft-deleted user → account deactivated
  if (user && !user.is_active) {
    return NextResponse.redirect(new URL('/account-deactivated', req.url));
  }

  const role = user?.role;

  // ── Role-based access guards ──────────────────────────────────────────────
  if (pathname.startsWith('/farmer') && role !== 'FARMER') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (pathname.startsWith('/wholesaler') && role !== 'WHOLESALER') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // ── Farmer setup wizard guard ──────────────────────────────────────────────
  // (handled by the setup wizard itself — not enforced in middleware)

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
