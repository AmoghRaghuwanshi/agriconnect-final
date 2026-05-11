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
 * 1. Logs in-app notification (stub — wire to Neon DB when ready).
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
  // In-app notification — log for now, insert into Neon DB when schema is ready
  console.log(`[notif] ${type} for user ${userId}: ${title}`, {
    titleHi,
    payload,
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
