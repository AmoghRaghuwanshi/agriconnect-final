import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST /api/auth/register — Register new user
export async function POST(request: Request) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const body = await request.json();
  const { name, email, password, phone, role = 'CONSUMER', farmName, businessName, location } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email, and password required' }, { status: 400 });
  }

  const sql = neon(databaseUrl);

  try {
    // Check if email exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const id = `${role.toLowerCase()}-${Date.now()}`;
    const avatar = role === 'FARMER' ? '👨‍🌾' : role === 'WHOLESALER' ? '🏭' : '👩';

    await sql`
      INSERT INTO users (id, name, email, password, phone, role, avatar, location, farm_name, business_name)
      VALUES (${id}, ${name}, ${email}, ${password}, ${phone || null}, ${role}, ${avatar}, ${location || null}, ${farmName || null}, ${businessName || null})
    `;

    return NextResponse.json({
      user: { id, name, email, phone, role, avatar, farmName, businessName },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
