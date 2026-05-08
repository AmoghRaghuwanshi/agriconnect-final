import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — AgriConnect',
  description: 'How AgriConnect collects, uses, and protects your personal data.',
};

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(245,245,240,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', height: '4rem', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.3rem', color: 'var(--green-900)' }}>🌾 AgriConnect</Link>
          <Link href="/" className="btn btn-ghost btn-sm">← Back to Home</Link>
        </div>
      </nav>
      <div className="container" style={{ maxWidth: '760px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div className="card" style={{ padding: '3rem' }}>
          <span className="badge badge-blue" style={{ marginBottom: '1rem' }}>Legal</span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Privacy Policy</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2.5rem' }}>Last updated: May 1, 2026</p>
          {[
            { title: '1. Data We Collect', body: 'We collect: name, email, phone number, delivery address, produce listing data, order history, and usage analytics. For farmers, we also collect farm location (latitude/longitude), produce photos, and voice recordings used for listing creation.' },
            { title: '2. How We Use Your Data', body: 'Your data is used to: facilitate transactions between farmers and buyers, send order notifications via WhatsApp and email, verify OTP for authentication, improve our AI voice agent, calculate farmer accuracy scores, and display mandi price information.' },
            { title: '3. Data Storage', body: 'All data is stored securely on Supabase (PostgreSQL) servers hosted in the ap-south-1 (Mumbai) region. Media files (produce images, avatars) are stored on Supabase Storage with CDN distribution.' },
            { title: '4. Data Sharing', body: 'We do not sell your personal data. We share data only with: payment processors (for order transactions), SMS/WhatsApp providers (for OTP and notifications), and analytics tools (PostHog) in anonymized form.' },
            { title: '5. Your Rights', body: 'You have the right to: access your personal data, correct inaccurate data, delete your account and all associated data, opt out of marketing communications, and export your data. Use the Settings → Danger Zone in your account to exercise these rights.' },
            { title: '6. Cookies', body: 'We use cookies only for: session management (keeping you logged in), and preference storage (language, notification settings). We do not use tracking or advertising cookies.' },
            { title: '7. Contact', body: 'For privacy-related queries, contact us at privacy@agriconnect.app. We respond within 7 business days.' },
          ].map((s) => (
            <div key={s.title} style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--green-900)' }}>{s.title}</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{s.body}</p>
            </div>
          ))}
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/legal/terms" className="btn btn-outline btn-sm">Terms of Service</Link>
            <Link href="/legal/refunds" className="btn btn-outline btn-sm">Refund Policy</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
