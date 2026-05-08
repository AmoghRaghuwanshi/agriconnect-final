'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

/**
 * Browser-side Supabase client.
 * Uses NEXT_PUBLIC_SUPABASE_ANON_KEY + respects RLS.
 * Use in: Client components, hooks, Zustand stores.
 */
export function createSupabaseClient() {
  return createClientComponentClient();
}

// Singleton for client components
let clientInstance: ReturnType<typeof createClientComponentClient> | null = null;

export function getSupabaseClient() {
  if (!clientInstance) {
    clientInstance = createClientComponentClient();
  }
  return clientInstance;
}
