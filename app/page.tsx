import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AgriConnect — Farm-to-Table Marketplace',
  description:
    'Connecting farmers directly with consumers and wholesalers across India. Fresh produce, fair prices, zero middlemen.',
};

export default function LandingPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(245,245,240,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
          height: '4rem',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          className="container"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <span
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 800,
              fontSize: '1.4rem',
              color: 'var(--green-900)',
              letterSpacing: '-0.02em',
            }}
          >
            🌾 AgriConnect
          </span>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link href="/mandi" className="btn btn-ghost btn-sm">Mandi Prices</Link>
            <Link href="/auth/consumer" className="btn btn-outline btn-sm">Sign In</Link>
            <Link href="/auth/consumer/register" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        style={{
          padding: '6rem 0 5rem',
          background: 'linear-gradient(160deg, var(--green-50) 0%, var(--bg-base) 60%)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <span className="badge badge-green" style={{ marginBottom: '1.5rem', fontSize: '0.75rem' }}>
            🚀 Now live — Join 1,200+ farmers
          </span>
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 900,
              lineHeight: 1.08,
              color: 'var(--text-primary)',
              marginBottom: '1.5rem',
              letterSpacing: '-0.03em',
            }}
          >
            Fresh from Farm.{' '}
            <span style={{ color: 'var(--green-900)' }}>Direct to You.</span>
          </h1>
          <p
            style={{
              fontSize: '1.2rem',
              color: 'var(--text-secondary)',
              maxWidth: '560px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.7,
            }}
          >
            AgriConnect removes middlemen so farmers earn more and consumers pay less.
            Real-time mandi prices, voice listings in Hindi, and secure escrow payments.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/marketplace" className="btn btn-primary btn-lg">
              🛒 Shop Fresh Produce
            </Link>
            <Link href="/auth/farmer" className="btn btn-outline btn-lg">
              🌾 I&apos;m a Farmer
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="section-sm" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="bento bento-4">
            {[
              { value: '1,200+', label: 'Verified Farmers' },
              { value: '18 States', label: 'Pan-India Coverage' },
              { value: '₹0', label: 'Platform Fee' },
              { value: '24/7', label: 'Voice Support (Hindi)' },
            ].map((stat) => (
              <div key={stat.label} className="stat-card" style={{ textAlign: 'center' }}>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Portal Cards ─────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="section-title">One platform. Every role.</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Whether you grow, buy, or trade — AgriConnect has a portal built for you.
            </p>
          </div>
          <div className="bento bento-3">
            {[
              {
                icon: '🌾',
                title: 'For Farmers',
                desc: 'List produce in 30 seconds using Hindi voice commands. Get fair prices, track orders, and build your reputation score.',
                color: 'var(--green-900)',
                bg: 'var(--green-50)',
                href: '/auth/farmer',
                cta: 'Start Selling',
              },
              {
                icon: '🛒',
                title: 'For Consumers',
                desc: 'Buy directly from verified farmers. Know exactly where your food comes from. Delivered fresh, priced fairly.',
                color: 'var(--consumer-primary)',
                bg: '#F0FFF4',
                href: '/marketplace',
                cta: 'Browse Produce',
              },
              {
                icon: '🏭',
                title: 'For Wholesalers',
                desc: 'Source bulk produce from hundreds of farmers. RFQ system, standing orders, credit ledger — all in one dashboard.',
                color: 'var(--wholesaler-primary)',
                bg: '#EFF6FF',
                href: '/auth/wholesaler',
                cta: 'Register Business',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="card"
                style={{ padding: '2rem', borderTop: `4px solid ${card.color}` }}
              >
                <div
                  style={{
                    width: '3.5rem',
                    height: '3.5rem',
                    borderRadius: '1rem',
                    background: card.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.75rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  {card.icon}
                </div>
                <h3
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    marginBottom: '0.75rem',
                    color: card.color,
                  }}
                >
                  {card.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                  {card.desc}
                </p>
                <Link
                  href={card.href}
                  className="btn btn-outline btn-sm"
                  style={{ borderColor: card.color, color: card.color }}
                >
                  {card.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section
        className="section"
        style={{ background: 'var(--green-900)', color: '#fff' }}
      >
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2
              style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                fontWeight: 800,
                color: '#fff',
                marginBottom: '1rem',
              }}
            >
              Built for Bharat
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>
              Every feature designed around how Indian farmers and consumers actually work.
            </p>
          </div>
          <div className="bento bento-3">
            {[
              { icon: '🎤', title: 'Hindi Voice Listings', desc: 'Farmers list produce by speaking in Hindi. AI extracts crop, quantity, price automatically.' },
              { icon: '📊', title: 'Live Mandi Prices', desc: 'Real-time APMC mandi rates from 18 states. Know before you sell.' },
              { icon: '🔒', title: 'Escrow Payments', desc: 'Money held safely until delivery confirmed. Both parties protected.' },
              { icon: '⭐', title: 'Farmer Score', desc: 'Accuracy, delivery, and rating score builds trust. Top farmers get priority placement.' },
              { icon: '📱', title: 'WhatsApp Alerts', desc: 'Order updates, OTPs, and notifications via WhatsApp — no app needed for farmers.' },
              { icon: '🌍', title: 'Works Offline', desc: 'PWA-enabled. Farmers in low-connectivity areas can still use core features.' },
            ].map((f) => (
              <div
                key={f.title}
                style={{
                  padding: '1.5rem',
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{f.icon}</div>
                <h3 style={{ color: '#fff', fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: '0.5rem', fontSize: '1rem' }}>
                  {f.title}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.875rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="section-sm" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="section-title" style={{ marginBottom: '0.75rem' }}>
            Ready to join the movement?
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto 2rem' }}>
            No fees. No middlemen. Just fair trade.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/consumer/register" className="btn btn-primary btn-lg">
              Create Account Free
            </Link>
            <Link href="/mandi" className="btn btn-outline btn-lg">
              See Today&apos;s Prices
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer
        style={{
          background: 'var(--text-primary)',
          color: 'rgba(255,255,255,0.6)',
          padding: '3rem 0',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div
          className="container"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}
        >
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>
            🌾 AgriConnect
          </span>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem' }}>
            <Link href="/legal/terms" style={{ color: 'inherit' }}>Terms</Link>
            <Link href="/legal/privacy" style={{ color: 'inherit' }}>Privacy</Link>
            <Link href="/legal/refunds" style={{ color: 'inherit' }}>Refunds</Link>
            <Link href="/mandi" style={{ color: 'inherit' }}>Mandi Prices</Link>
          </div>
          <span style={{ fontSize: '0.8rem' }}>© 2026 AgriConnect. Made for Indian Farmers.</span>
        </div>
      </footer>
    </main>
  );
}

