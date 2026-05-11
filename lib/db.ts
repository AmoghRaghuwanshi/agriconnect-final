import { neon } from '@neondatabase/serverless';

/**
 * Neon Serverless Postgres client.
 * Connection string comes from Netlify's Neon integration
 * (auto-injected as DATABASE_URL env var).
 *
 * Usage in API routes / server actions:
 *   import { getDb } from '@/lib/db';
 *   const sql = getDb();
 *   const users = await sql`SELECT * FROM users LIMIT 10`;
 */

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is not set. Add a Neon database via Netlify Integrations.'
    );
  }
  return neon(databaseUrl);
}
