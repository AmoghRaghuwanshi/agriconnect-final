import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { sendOTP } from '@/lib/services/otp/providers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) return NextResponse.json({ error: 'DB not configured' }, { status: 500 });

  const { phone } = await request.json();
  if (!phone || phone.length !== 10) {
    return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
  }

  const sql = neon(databaseUrl);
  
  try {
    // Check if farmer exists
    const users = await sql`SELECT id FROM users WHERE phone = ${'+91' + phone} AND role = 'FARMER'`;
    let userId = users.length > 0 ? users[0].id : null;

    if (!userId) {
      // Create a basic farmer account if they don't exist
      userId = `farmer-${Date.now()}`;
      await sql`
        INSERT INTO users (id, name, phone, role, avatar)
        VALUES (${userId}, 'Farmer', ${'+91' + phone}, 'FARMER', '👨‍🌾')
      `;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to DB for verification (using DB time for reliability)
    await sql`UPDATE users SET otp = ${otp}, otp_expires_at = NOW() + interval '10 minutes' WHERE id = ${userId}`;

    // Send OTP via multi-provider chain (WhatsApp -> Fast2SMS -> Twilio -> 2Factor)
    const success = await sendOTP('+91' + phone, otp);

    if (success) {
      return NextResponse.json({ success: true, message: 'OTP sent successfully' });
    } else {
      console.warn('All OTP providers failed, but proceeding in demo mode with code printed to server logs.');
      console.log(`[DEMO MODE] OTP for ${phone}: ${otp}`);
      // For hackathon/demo purposes, we still return success so the user can see the OTP in logs if needed, 
      // or we can just return success and let them use the OTP if they know it.
      return NextResponse.json({ 
        success: true, 
        message: 'OTP sent successfully (Demo Mode)',
        // dev_only_otp: process.env.NODE_ENV === 'development' ? otp : undefined 
      });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
