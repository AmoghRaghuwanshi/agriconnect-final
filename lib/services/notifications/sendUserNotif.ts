import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendEmail } from '@/lib/services/email/providers';
import { sendWhatsApp } from '@/lib/services/otp/providers';

interface NotifPayload {
  userId: string;
  type: string;
  title: string;
  titleHi?: string;
  payload?: Record<string, unknown>;
  // Optionally also push via channel:
  email?: string;
  phone?: string;
  emailSubject?: string;
  emailHtml?: string;
  whatsappMessage?: string;
}

/**
 * Central notification dispatcher.
 * 1. Always writes to `notifications` table (in-app bell).
 * 2. Optionally sends email and/or WhatsApp based on user preferences.
 */
export async function sendUserNotif({
  userId,
  type,
  title,
  titleHi,
  payload,
  email,
  phone,
  emailSubject,
  emailHtml,
  whatsappMessage,
}: NotifPayload): Promise<void> {
  // Always insert in-app notification
  await supabaseAdmin.from('notifications').insert({
    user_id: userId,
    type,
    title,
    title_hi: titleHi,
    payload: payload ?? {},
    is_read: false,
  });

  // Send email if provided
  if (email && emailSubject && emailHtml) {
    await sendEmail(email, emailSubject, emailHtml).catch((err) =>
      console.warn('[notif] Email send failed:', err.message)
    );
  }

  // Send WhatsApp if provided
  if (phone && whatsappMessage) {
    await sendWhatsApp(phone, whatsappMessage).catch((err) =>
      console.warn('[notif] WhatsApp send failed:', err.message)
    );
  }
}
