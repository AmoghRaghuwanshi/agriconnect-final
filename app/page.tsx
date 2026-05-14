import type { Metadata } from 'next';
import Link from 'next/link';
import { ScrollReveal, CountUp } from '@/components/shared/LandingAnimations';

export const metadata: Metadata = {
  title: 'AgriConnect — Farm-to-Table Marketplace',
  description:
    'Connecting farmers directly with consumers and wholesalers across India. Fresh produce, fair prices, zero middlemen.',
};

export default function LandingPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#FAFAF8' }}>
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="landing-nav">
        <div className="container landing-nav-inner">
          <Link href="/" className="landing-logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M7 20l5-16 5 16"/><path d="M4 17c2-4 5-6 8-6s6 2 8 6"/></svg>
            AgriConnect
          </Link>
          <div className="landing-nav-links">
            <Link href="/mandi" className="landing-nav-link hide-mobile">Mandi Prices</Link>
            <Link href="/auth/consumer" className="landing-nav-link hide-mobile">Sign In</Link>
            <Link href="/auth/consumer" className="landing-nav-cta">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="landing-hero">
        <div className="container landing-hero-inner">
          <ScrollReveal delay={0}>
            <span className="landing-badge">
              🚀 NOW LIVE — JOIN 1,200+ FARMERS
            </span>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <h1 className="landing-h1">
              Fresh from Farm.
              <br />
              <span className="landing-h1-accent">Direct to You.</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p className="landing-hero-sub">
              AgriConnect removes middlemen so farmers earn more and
              consumers pay less. Real-time mandi prices, voice listings in Hindi,
              and secure escrow payments.
            </p>
          </ScrollReveal>

          {/* Search bar */}
          <ScrollReveal delay={300}>
            <form action="/marketplace" className="landing-search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                name="q"
                placeholder="Search fresh produce, farmers..."
                className="landing-search-input"
                style={{ border: 'none', outline: 'none' }}
              />
              <button type="submit" className="landing-search-btn" style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Find</button>
            </form>
          </ScrollReveal>

          <ScrollReveal delay={400}>
            <div className="landing-cta-row">
              <Link href="/marketplace" className="landing-cta-primary">🛒 Shop Fresh Produce</Link>
              <Link href="/auth/farmer" className="landing-cta-outline">🌾 I&apos;m a Farmer</Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="landing-stats-section">
        <div className="container">
          <div className="landing-stats-grid">
            {[
              { target: 1200, suffix: '+', label: 'Verified Farmers' },
              { target: 18, suffix: ' States', label: 'Pan-India Coverage' },
              { target: 0, prefix: '₹', suffix: '', label: 'Platform Fee' },
              { target: 24, suffix: '/7', label: 'Voice Support (Hindi)' },
            ].map((stat, i) => (
              <ScrollReveal key={stat.label} delay={i * 100}>
                <div className="landing-stat">
                  <div className="landing-stat-value">
                    <CountUp target={stat.target} suffix={stat.suffix} prefix={stat.prefix || ''} duration={1400} />
                  </div>
                  <div className="landing-stat-label">{stat.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Portal Cards ─────────────────────────────────────────────────── */}
      <section className="landing-portals-section">
        <div className="container">
          <ScrollReveal>
            <div className="landing-section-header">
              <h2 className="landing-section-title">One platform. Every role.</h2>
              <p className="landing-section-sub">
                Whether you grow, buy, or trade — AgriConnect has a portal built for you.
              </p>
            </div>
          </ScrollReveal>
          <div className="landing-portals-grid">
            {[
              {
                icon: '🌾', title: 'For Farmers',
                desc: 'List produce in 30 seconds using Hindi voice commands. Get fair prices, track orders, and build your reputation score.',
                accent: '#1B4332', iconBg: '#D1FAE5',
                href: '/auth/farmer', cta: 'Start Selling',
              },
              {
                icon: '🛒', title: 'For Consumers',
                desc: 'Buy directly from verified farmers. Know exactly where your food comes from. Delivered fresh, priced fairly.',
                accent: '#FF6B35', iconBg: '#FFEDD5',
                href: '/marketplace', cta: 'Browse Produce',
              },
              {
                icon: '🏭', title: 'For Wholesalers',
                desc: 'Source bulk produce from hundreds of farmers. RFQ system, standing orders, credit ledger — all in one dashboard.',
                accent: '#1E40AF', iconBg: '#DBEAFE',
                href: '/auth/wholesaler', cta: 'Register Business',
              },
            ].map((card, i) => (
              <ScrollReveal key={card.title} delay={i * 120}>
                <div className="landing-portal-card">
                  <div className="landing-portal-icon" style={{ background: card.iconBg }}>
                    {card.icon}
                  </div>
                  <h3 className="landing-portal-title" style={{ color: card.accent }}>{card.title}</h3>
                  <p className="landing-portal-desc">{card.desc}</p>
                  <Link href={card.href} className="landing-portal-cta" style={{ background: card.accent }}>
                    {card.cta} →
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features — Built for Bharat ─────────────────────────────────── */}
      <section className="landing-features-section">
        <div className="container">
          <ScrollReveal>
            <div className="landing-section-header">
              <h2 className="landing-section-title" style={{ color: '#fff' }}>Built for Bharat</h2>
              <p className="landing-section-sub" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Every feature designed around how Indian farmers and consumers actually work.
              </p>
            </div>
          </ScrollReveal>
          <div className="landing-features-grid">
            {[
              { icon: '🎤', title: 'Hindi Voice Listings', desc: 'Farmers list produce by speaking in Hindi. AI extracts crop, quantity, price automatically.', iconBg: '#FFD166' },
              { icon: '📊', title: 'Live Mandi Prices', desc: 'Real-time APMC mandi rates from 18 states. Know before you sell.', iconBg: '#60A5FA' },
              { icon: '🔒', title: 'Escrow Payments', desc: 'Money held safely until delivery confirmed. Both parties protected.', iconBg: '#FB923C' },
              { icon: '⭐', title: 'Farmer Score', desc: 'Accuracy, delivery, and rating score builds trust. Top farmers get priority placement.', iconBg: '#FBBF24' },
              { icon: '📱', title: 'WhatsApp Alerts', desc: 'Order updates, OTPs, and notifications via WhatsApp — no app needed for farmers.', iconBg: '#34D399' },
              { icon: '🌍', title: 'Works Offline', desc: 'PWA-enabled. Farmers in low-connectivity areas can still use core features.', iconBg: '#818CF8' },
            ].map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 80}>
                <div className="landing-feature-card">
                  <div className="landing-feature-icon" style={{ background: f.iconBg }}>{f.icon}</div>
                  <h3 className="landing-feature-title">{f.title}</h3>
                  <p className="landing-feature-desc">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="landing-final-cta">
        <div className="container" style={{ textAlign: 'center' }}>
          <ScrollReveal>
            <h2 className="landing-section-title">Ready to join the movement?</h2>
            <p className="landing-section-sub" style={{ marginBottom: '2rem' }}>
              No fees. No middlemen. Just fair trade.
            </p>
            <div className="landing-cta-row">
              <Link href="/auth/consumer" className="landing-cta-primary">Create Account Free</Link>
              <Link href="/mandi" className="landing-cta-ghost">See Today&apos;s Prices</Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="container landing-footer-inner">
          <Link href="/" className="landing-footer-logo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M7 20l5-16 5 16"/><path d="M4 17c2-4 5-6 8-6s6 2 8 6"/></svg>
            AgriConnect
          </Link>
          <div className="landing-footer-links">
            <Link href="/legal/terms">Terms</Link>
            <Link href="/legal/privacy">Privacy</Link>
            <Link href="/legal/refunds">Refunds</Link>
            <Link href="/mandi">Mandi Prices</Link>
          </div>
          <span className="landing-footer-copy">© 2026 AgriConnect. Made for Indian Farmers.</span>
        </div>
      </footer>
    </main>
  );
}
