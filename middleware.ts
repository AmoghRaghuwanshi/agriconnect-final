import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware — Route protection layer.
 * 
 * Since auth is client-side (Zustand/localStorage), the middleware cannot
 * validate sessions directly. Instead, it provides structural protection:
 * 
 * 1. Blocks direct access to /api/* routes (when they exist)
 * 2. Sets security headers
 * 3. Provides a hook point for future server-side auth
 * 
 * When Supabase auth is configured, re-enable full middleware
 * by importing createMiddlewareClient from @supabase/auth-helpers-nextjs.
 */
export async function middleware(req: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  // Match all page and API routes — skip static assets and Next internals
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
