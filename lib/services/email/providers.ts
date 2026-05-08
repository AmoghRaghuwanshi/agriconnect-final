import { apiChain } from '@/lib/utils/apiChain';

// ── Provider 1: Resend ────────────────────────────────────────────────────
async function sendViaResend(
  to: string,
  subject: string,
  html: string
): Promise<boolean | null> {
  if (!process.env.RESEND_API_KEY) return null;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'AgriConnect <no-reply@agriconnect.app>',
      to,
      subject,
      html,
    }),
    signal: AbortSignal.timeout(10000),
  });
  return res.ok ? true : null;
}
// Free: 3,000 emails/month, 100/day

// ── Provider 2: Brevo ─────────────────────────────────────────────────────
async function sendViaBrevo(
  to: string,
  subject: string,
  html: string
): Promise<boolean | null> {
  if (!process.env.BREVO_API_KEY) return null;

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'AgriConnect', email: 'no-reply@agriconnect.app' },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
    signal: AbortSignal.timeout(10000),
  });
  return res.ok ? true : null;
}
// Free: 300 emails/day

// ── Provider 3: SendGrid ──────────────────────────────────────────────────
async function sendViaSendGrid(
  to: string,
  subject: string,
  html: string
): Promise<boolean | null> {
  if (!process.env.SENDGRID_API_KEY) return null;

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: 'no-reply@agriconnect.app', name: 'AgriConnect' },
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
    signal: AbortSignal.timeout(10000),
  });
  return res.ok ? true : null;
}
// Free: 100 emails/day forever

// ── Provider 4: Mailgun ───────────────────────────────────────────────────
async function sendViaMailgun(
  to: string,
  subject: string,
  html: string
): Promise<boolean | null> {
  if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) return null;

  const res = await fetch(
    `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        from: 'AgriConnect <no-reply@agriconnect.app>',
        to,
        subject,
        html,
      }),
      signal: AbortSignal.timeout(10000),
    }
  );
  return res.ok ? true : null;
}
// Free: 100 emails/day (Flex plan)

// ── Provider 5: Gmail SMTP ────────────────────────────────────────────────
async function sendViaGmailSMTP(
  to: string,
  subject: string,
  html: string
): Promise<boolean | null> {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return null;

  try {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
    await transporter.sendMail({
      from: `AgriConnect <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch {
    return null;
  }
}
// Free: 500 emails/day via Gmail

// ── Main export ───────────────────────────────────────────────────────────
export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  return await apiChain(
    [
      () => sendViaResend(to, subject, html),
      () => sendViaBrevo(to, subject, html),
      () => sendViaSendGrid(to, subject, html),
      () => sendViaMailgun(to, subject, html),
      () => sendViaGmailSMTP(to, subject, html),
    ],
    false,
    'email-send'
  );
}
