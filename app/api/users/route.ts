import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/users — Fetch all users
export async function GET() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return NextResponse.json({ users: [] });

  const sql = neon(databaseUrl);

  try {
    const rows = await sql`
      SELECT id, name, email, phone, role, created_at
      FROM users
      ORDER BY created_at DESC
    `;

    const users = rows.map(r => ({
      id: r.id,
      name: r.name,
      role: r.role,
      contact: r.email || r.phone || 'N/A',
      status: 'Active', // Mocking status since we don't have a status col in DB yet, but could be added later
      joined: new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    }));

    return NextResponse.json({ users, source: 'neon' });
  } catch (error) {
    return NextResponse.json({ users: [], error: String(error) }, { status: 500 });
  }
}
