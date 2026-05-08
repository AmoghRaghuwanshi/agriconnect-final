import { NextRequest } from 'next/server';

/**
 * Verifies cron job requests are coming from Netlify Scheduled Functions
 * (or manual admin triggers) by checking the Authorization header.
 * Returns true if authorized, false otherwise.
 */
export function verifyCronAuth(req: NextRequest): boolean {
  const auth = req.headers.get('authorization');
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}
