import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service — AgriConnect',
  description: 'AgriConnect Terms of Service — Rules for using the platform.',
};

export default function TermsPage() {
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
          <span className="badge badge-green" style={{ marginBottom: '1rem' }}>Legal</span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Terms of Service</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2.5rem' }}>Last updated: May 1, 2026</p>
          {[
            { title: '1. Acceptance of Terms', body: 'By accessing or using AgriConnect, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.' },
            { title: '2. Use of Platform', body: 'AgriConnect provides a marketplace connecting farmers, consumers, and wholesalers. You may use the platform only for lawful purposes and in accordance with these Terms. You agree not to use the platform to post false, misleading, or fraudulent listings.' },
            { title: '3. Farmer Listings', body: 'Farmers are responsible for the accuracy of their produce listings, including quantity, quality, and price. AgriConnect monitors accuracy via our farmer score system. Repeated inaccuracies may result in account suspension.' },
            { title: '4. Payments & Escrow', body: 'All payments are processed through our mock escrow system for the hackathon demonstration. Funds are held until delivery is confirmed by the buyer. In production, real payment processing via UPI and cards will be implemented.' },
            { title: '5. Disputes', body: 'Disputes between buyers and farmers must be reported within 48 hours of expected delivery. AgriConnect admins will review evidence and resolve disputes within 7 days. Auto-resolution favors the farmer after 7 days of no admin action.' },
            { title: '6. Account Termination', body: 'AgriConnect reserves the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or consistently receive poor accuracy scores (below 50%).' },
            { title: '7. Limitation of Liability', body: 'AgriConnect is not liable for any indirect, incidental, special, or consequential damages arising from your use of the platform, including but not limited to produce quality disputes, delivery failures, or payment processing errors.' },
            { title: '8. Changes to Terms', body: 'We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Continued use of the platform constitutes acceptance of the modified terms.' },
          ].map((s) => (
            <div key={s.title} style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--green-900)' }}>{s.title}</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{s.body}</p>
            </div>
          ))}
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/legal/privacy" className="btn btn-outline btn-sm">Privacy Policy</Link>
            <Link href="/legal/refunds" className="btn btn-outline btn-sm">Refund Policy</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
