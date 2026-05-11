import { apiChain } from '@/lib/utils/apiChain';
import { sendEmail } from '@/lib/services/email/providers';

// ── Provider 1: Meta WhatsApp Cloud API ──────────────────────────────────
async function sendViaMetaWhatsApp(
  phone: string,
  otp: string
): Promise<boolean | null> {
  if (!process.env.META_ACCESS_TOKEN || !process.env.META_PHONE_NUMBER_ID) return null;

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${process.env.META_PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone.replace('+', ''),
        type: 'template',
        template: {
          name: 'otp_template',
          language: { code: 'hi' },
          components: [
            {
              type: 'body',
              parameters: [{ type: 'text', text: otp }],
            },
          ],
        },
      }),
      signal: AbortSignal.timeout(8000),
    }
  );
  return res.ok ? true : null;
}
// Free: 1,000 conversations/month

// ── Provider 2: Fast2SMS ──────────────────────────────────────────────────
async function sendViaFast2SMS(
  phone: string,
  otp: string
): Promise<boolean | null> {
  if (!process.env.FAST2SMS_API_KEY) return null;

  const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
    method: 'POST',
    headers: {
      authorization: process.env.FAST2SMS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      route: 'otp',
      variables_values: otp,
      numbers: phone.replace('+91', ''),
    }),
    signal: AbortSignal.timeout(8000),
  });
  const data = await res.json();
  return data.return === true ? true : null;
}
// Free: 100 SMS on signup

// ── Provider 3: Twilio ────────────────────────────────────────────────────
async function sendViaTwilio(
  phone: string,
  otp: string
): Promise<boolean | null> {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) return null;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: phone,
        From: process.env.TWILIO_PHONE_NUMBER!,
        Body: `AgriConnect OTP: ${otp}. Valid for 10 minutes. / आपका OTP: ${otp}`,
      }),
      signal: AbortSignal.timeout(10000),
    }
  );
  return res.ok ? true : null;
}
// Free: $15 trial credit

// ── Provider 4: 2Factor.in ────────────────────────────────────────────────
async function sendVia2Factor(
  phone: string,
  otp: string
): Promise<boolean | null> {
  if (!process.env.TWOFACTOR_API_KEY) return null;

  const res = await fetch(
    `https://2factor.in/API/V1/${process.env.TWOFACTOR_API_KEY}/SMS/${phone.replace(
      '+91',
      ''
    )}/${otp}/AgriConnect`,
    { signal: AbortSignal.timeout(8000) }
  );
  const data = await res.json();
  return data.Status === 'Success' ? true : null;
}
// Free: 10 SMS/day

// ── Provider 5: Email OTP fallback ────────────────────────────────────────
async function sendViaEmailOTP(
  _phone: string,
  _otp: string
): Promise<boolean | null> {
  // Requires DB lookup for user email — not available in demo mode.
  // When Neon DB is wired with a users table, re-enable this.
  return null;
}

// ── Main OTP export ────────────────────────────────────────────────────────
export async function sendOTP(phone: string, otp: string): Promise<boolean> {
  return await apiChain(
    [
      () => sendViaMetaWhatsApp(phone, otp),
      () => sendViaFast2SMS(phone, otp),
      () => sendViaTwilio(phone, otp),
      () => sendVia2Factor(phone, otp),
      () => sendViaEmailOTP(phone, otp),
    ],
    false,
    'otp-send'
  );
}

// ── WhatsApp notification (order updates, farmer alerts) ───────────────────
export async function sendWhatsApp(
  phone: string,
  message: string
): Promise<boolean> {
  if (!process.env.META_ACCESS_TOKEN || !process.env.META_PHONE_NUMBER_ID) {
    console.warn('[whatsapp] META credentials not set — skipping notification');
    return false;
  }

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${process.env.META_PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone.replace('+', ''),
        type: 'text',
        text: { body: message },
      }),
      signal: AbortSignal.timeout(8000),
    }
  );
  return res.ok;
}
