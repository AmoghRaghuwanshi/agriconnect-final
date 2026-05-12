import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import twilio from 'twilio';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const databaseUrl = process.env.DATABASE_URL;
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioVerifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!databaseUrl) return NextResponse.json({ error: 'DB not configured' }, { status: 500 });
  if (!twilioAccountSid || !twilioAuthToken || !twilioVerifyServiceSid) {
    return NextResponse.json({ error: 'Twilio service not configured' }, { status: 500 });
  }

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

    // Initialize Twilio Client
    const client = twilio(twilioAccountSid, twilioAuthToken);

    // Send OTP via Twilio Verify
    const verification = await client.verify.v2
      .services(twilioVerifyServiceSid)
      .verifications.create({ to: '+91' + phone, channel: 'sms' });

    if (verification.status === 'pending') {
      return NextResponse.json({ success: true, message: 'OTP sent successfully' });
    } else {
      console.error('Twilio Error Status:', verification.status);
      return NextResponse.json({ error: 'Failed to send OTP via SMS.' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 });
  }
}
