import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) return NextResponse.json({ error: 'DB not configured' }, { status: 500 });

  const { phone, otp } = await request.json();
  if (!phone || !otp) return NextResponse.json({ error: 'Phone and OTP required' }, { status: 400 });

  const sql = neon(databaseUrl);

  try {
    const users = await sql`
      SELECT id, name, email, phone, role, avatar, location, farm_name, business_name, accuracy, otp, otp_expires_at
      FROM users 
      WHERE phone = ${'+91' + phone} AND role = 'FARMER'
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const u = users[0];

    // Check OTP (bypass for demo/hackathon purposes if needed, but here we check DB)
    if (otp === '123456') {
      // Keep bypass active for hackathon ease-of-use
    } else {
      if (!u.otp || u.otp !== otp) {
        return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 });
      }

      // Check expiration against DB time
      const expiryCheck = await sql`SELECT (NOW() > ${u.otp_expires_at}) as expired`;
      if (expiryCheck[0].expired) {
        return NextResponse.json({ error: 'OTP expired' }, { status: 401 });
      }
    }

    // Clear OTP after successful use
    await sql`UPDATE users SET otp = NULL, otp_expires_at = NULL WHERE id = ${u.id}`;

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
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
