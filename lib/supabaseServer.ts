import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * Server Component Supabase client.
 * Reads session from cookies — works in Server Components and API routes.
 * Respects RLS — each user sees only their own data.
 */
export function createSupabaseServer() {
  const cookieStore = cookies();
  return createServerComponentClient({ cookies: () => cookieStore });
}
