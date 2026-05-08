import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Refund Policy — AgriConnect',
  description: 'AgriConnect refund and return policy for produce orders.',
};

export default function RefundsPage() {
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
          <span className="badge badge-terra" style={{ marginBottom: '1rem' }}>Legal</span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Refund Policy</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2.5rem' }}>Last updated: May 1, 2026</p>

          <div className="alert alert-warning" style={{ marginBottom: '2rem' }}>
            <span>⚠️</span>
            <span>All sales of fresh produce are final once dispatched. Refunds are only issued for non-delivery or verified quality issues.</span>
          </div>

          {[
            { title: 'Eligible Refund Cases', body: 'You may be eligible for a refund if: (1) your order was never dispatched, (2) you received significantly less quantity than ordered (below 90% of ordered weight), (3) the produce arrived in a completely damaged/rotten condition (with photographic evidence submitted within 24 hours of delivery).' },
            { title: 'Non-Eligible Cases', body: 'Refunds are NOT issued for: minor quantity variations within ±10% of ordered weight, personal preference (you disliked the taste/variety), price changes after order confirmation, or delays caused by logistics that are outside our control.' },
            { title: 'How to Raise a Dispute', body: 'Go to your Orders page → select the order → tap "Raise Dispute." Upload photos of the issue and describe the problem. Our team will respond within 48 hours. You can also report via WhatsApp at our support number.' },
            { title: 'Refund Timeline', body: 'Approved refunds are processed within 5-7 business days. For UPI payments, refunds reflect in 1-3 days. For card payments, 5-7 days depending on your bank. Platform credits are instant.' },
            { title: 'Escrow Protection', body: 'Your payment is held in escrow and only released to the farmer after you confirm delivery. This means if you report a problem before confirming, the payment is automatically held pending resolution.' },
          ].map((s) => (
            <div key={s.title} style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--green-900)' }}>{s.title}</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{s.body}</p>
            </div>
          ))}
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/legal/terms" className="btn btn-outline btn-sm">Terms of Service</Link>
            <Link href="/legal/privacy" className="btn btn-outline btn-sm">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
