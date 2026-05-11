import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

/**
 * GET /api/db/health — Quick health check for Neon connection.
 */
export async function GET() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return NextResponse.json(
      { status: 'error', message: 'DATABASE_URL not configured' },
      { status: 500 }
    );
  }

  try {
    const sql = neon(databaseUrl);
    const result = await sql`SELECT NOW() as server_time, current_database() as db_name`;

    return NextResponse.json({
      status: 'connected',
      database: result[0].db_name,
      serverTime: result[0].server_time,
      provider: 'Neon Serverless Postgres',
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: String(error) },
      { status: 500 }
    );
  }
}
