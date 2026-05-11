import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST /api/auth/login — Login with email + password
export async function POST(request: Request) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const { email, password } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }

  const sql = neon(databaseUrl);

  try {
    const users = await sql`
      SELECT id, name, email, phone, role, avatar, location, farm_name, business_name, accuracy
      FROM users WHERE email = ${email} AND password = ${password}
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const u = users[0];
    return NextResponse.json({
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        avatar: u.avatar,
        farmName: u.farm_name,
        businessName: u.business_name,
        accuracy: u.accuracy ? Number(u.accuracy) : undefined,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
