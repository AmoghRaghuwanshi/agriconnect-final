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

  const { phone, otp } = await request.json();
  if (!phone || !otp) return NextResponse.json({ error: 'Phone and OTP required' }, { status: 400 });

  const sql = neon(databaseUrl);

  try {
    const users = await sql`
      SELECT id, name, email, phone, role, avatar, location, farm_name, business_name, accuracy
      FROM users 
      WHERE phone = ${'+91' + phone} AND role = 'FARMER'
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const u = users[0];

    // Initialize Twilio Client
    const client = twilio(twilioAccountSid, twilioAuthToken);
    
    // Verify OTP with Twilio (bypass for demo/hackathon purposes)
    let verificationCheck;
    if (otp === '123456') {
      verificationCheck = { status: 'approved' };
    } else {
      try {
        verificationCheck = await client.verify.v2
          .services(twilioVerifyServiceSid)
          .verificationChecks.create({ to: '+91' + phone, code: otp });
      } catch (twError: any) {
        console.error('Twilio Verify Check error:', twError);
        return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
      }
    }

    if (verificationCheck.status !== 'approved') {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 });
    }

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
