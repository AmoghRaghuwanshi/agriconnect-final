import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

/**
 * GET /api/listings — Fetch all active listings from Neon DB.
 * Used by marketplace page.
 */
export async function GET() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return NextResponse.json({ listings: [], source: 'no-db' });
  }

  try {
    const sql = neon(databaseUrl);
    const listings = await sql`
      SELECT
        l.*,
        u.name as farmer_name,
        u.farm_name,
        u.location as farmer_location
      FROM listings l
      JOIN users u ON l.farmer_id = u.id
      WHERE l.status = 'active'
      ORDER BY l.created_at DESC
    `;

    return NextResponse.json({ listings, source: 'neon' });
  } catch (error) {
    console.error('[api/listings] Error:', error);
    return NextResponse.json(
      { listings: [], source: 'error', error: String(error) },
      { status: 500 }
    );
  }
}
