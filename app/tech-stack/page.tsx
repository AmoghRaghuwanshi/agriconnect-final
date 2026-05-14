'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

/* ── Animated counter ─────────────────────────────────────────── */
function AnimNum({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = Math.ceil(target / 40);
        const id = setInterval(() => { start += step; if (start >= target) { start = target; clearInterval(id); } setVal(start); }, 30);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ── Reveal on scroll ─────────────────────────────────────────── */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

/* ── Floating particles background ────────────────────────────── */
function Particles() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: `${4 + Math.random() * 8}px`,
          height: `${4 + Math.random() * 8}px`,
          borderRadius: '50%',
          background: `rgba(255,255,255,${0.05 + Math.random() * 0.1})`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `float${i % 3} ${8 + Math.random() * 12}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 5}s`,
        }} />
      ))}
      <style>{`
        @keyframes float0 { 0%,100% { transform: translate(0, 0) } 50% { transform: translate(20px, -30px) } }
        @keyframes float1 { 0%,100% { transform: translate(0, 0) } 50% { transform: translate(-25px, 20px) } }
        @keyframes float2 { 0%,100% { transform: translate(0, 0) } 50% { transform: translate(15px, 25px) } }
      `}</style>
    </div>
  );
}

/* ── Data flow animation ──────────────────────────────────────── */
function DataFlowLine() {
  return (
    <div style={{ width: '100%', height: '4px', background: '#1e293b', borderRadius: '2px', position: 'relative', overflow: 'hidden', margin: '2rem 0' }}>
      <div style={{
        position: 'absolute', top: 0, left: '-30%', width: '30%', height: '100%',
        background: 'linear-gradient(90deg, transparent, #22c55e, #3b82f6, transparent)',
        animation: 'dataflow 2s linear infinite',
        borderRadius: '2px',
      }} />
      <style>{`@keyframes dataflow { 0% { left: -30% } 100% { left: 100% } }`}</style>
    </div>
  );
}

/* ── Tech Card ────────────────────────────────────────────────── */
function TechCard({ icon, name, role, color, delay }: { icon: string; name: string; role: string; color: string; delay: number }) {
  return (
    <Reveal delay={delay}>
      <div style={{
        background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '1.75rem',
        position: 'relative', overflow: 'hidden', cursor: 'default',
        transition: 'transform 0.3s, border-color 0.3s, box-shadow 0.3s',
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 12px 40px ${color}25`; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.boxShadow = ''; }}
      >
        <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: `radial-gradient(circle at 100% 0%, ${color}15, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{icon}</div>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem', color: '#f1f5f9' }}>{name}</div>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>{role}</div>
        <div style={{ marginTop: '1rem', width: '40px', height: '3px', borderRadius: '2px', background: color }} />
      </div>
    </Reveal>
  );
}

/* ── Architecture node ────────────────────────────────────────── */
function ArchNode({ label, sub, color, icon }: { label: string; sub: string; color: string; icon: string }) {
  return (
    <div style={{
      background: '#0f172a', border: `1px solid ${color}40`, borderRadius: '12px', padding: '1rem 1.25rem',
      display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '200px',
    }}>
      <div style={{ fontSize: '1.5rem' }}>{icon}</div>
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f1f5f9' }}>{label}</div>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{sub}</div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/* MAIN PAGE                                                       */
/* ──────────────────────────────────────────────────────────────── */

export default function TechStackPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#e2e8f0', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', padding: '6rem 1.5rem 4rem', textAlign: 'center', overflow: 'hidden' }}>
        <Particles />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
          <Reveal>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '99px', padding: '6px 16px', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
              Production Architecture
              <style>{`@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }`}</style>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1rem', background: 'linear-gradient(135deg, #f1f5f9, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Technology Stack
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto 2rem' }}>
              AgriConnect is powered by a modern, AI-first architecture designed for scale, speed, and accessibility for Indian farmers.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
              {[
                { n: 15, s: '+', l: 'APIs Integrated' },
                { n: 5, s: '', l: 'AI Models Rotated' },
                { n: 3, s: '', l: 'Data Pipelines' },
                { n: 4, s: '', l: 'User Portals' },
              ].map(s => (
                <div key={s.l} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#22c55e' }}><AnimNum target={s.n} suffix={s.s} /></div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CORE STACK ── */}
      <section style={{ padding: '4rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <Reveal>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.5rem' }}>Core Stack</h2>
          <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '3rem' }}>The foundation that powers every interaction</p>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <TechCard icon="⚡" name="Next.js 14" role="Full-stack React framework with App Router, Server Components, and Turbopack for instant HMR" color="#ffffff" delay={0} />
          <TechCard icon="🧠" name="Gemini 2.5 Flash" role="Google's latest AI model with 1M token context. 5-key rotation for zero-downtime free-tier usage" color="#4285f4" delay={80} />
          <TechCard icon="🐘" name="Neon PostgreSQL" role="Serverless Postgres with branching, auto-scaling, and sub-10ms cold starts globally" color="#00e5a0" delay={160} />
          <TechCard icon="📱" name="TypeScript" role="End-to-end type safety across API routes, components, and data models" color="#3178c6" delay={240} />
        </div>
      </section>

      <DataFlowLine />

      {/* ── AI & GIS LAYER ── */}
      <section style={{ padding: '4rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <Reveal>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.5rem' }}>AI & GIS Intelligence Layer</h2>
          <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '3rem' }}>Real data. Real AI. No mocks.</p>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <TechCard icon="🛰️" name="Google Maps + Drawing" role="Satellite view field mapping with polygon drawing. Auto-calculates area in hectares from GPS coordinates" color="#34a853" delay={0} />
          <TechCard icon="🌍" name="SoilGrids REST API" role="Live soil data (pH, nitrogen, organic carbon, clay%) from ISRIC for any GPS coordinate on Earth" color="#8b5cf6" delay={80} />
          <TechCard icon="🌦️" name="Open-Meteo API" role="14-day weather forecast with evapotranspiration, drought risk, and heat stress detection" color="#0ea5e9" delay={160} />
          <TechCard icon="🗣️" name="Web Speech API" role="Browser-native Hindi Text-to-Speech for reading advisories aloud to farmers" color="#f59e0b" delay={240} />
        </div>
      </section>

      <DataFlowLine />

      {/* ── DATA FLOW ARCHITECTURE ── */}
      <section style={{ padding: '4rem 1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
        <Reveal>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.5rem' }}>How It Works</h2>
          <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '3rem' }}>The data flow from field to AI prediction</p>
        </Reveal>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          {[
            { step: '1', icon: '📍', label: 'Farmer Maps Field', sub: 'GPS + Google Maps Drawing API', color: '#22c55e' },
            { step: '2', icon: '🌍', label: 'Fetch Soil Data', sub: 'SoilGrids API → pH, N, OC, Clay', color: '#8b5cf6' },
            { step: '3', icon: '🌦️', label: 'Fetch Weather', sub: 'Open-Meteo → 14-day forecast + NDVI', color: '#0ea5e9' },
            { step: '4', icon: '🧠', label: 'Gemini Analysis', sub: '2.5 Flash + 5-key rotation → JSON report', color: '#f59e0b' },
            { step: '5', icon: '💾', label: 'Cache in Neon', sub: 'Store result → instant reload next time', color: '#00e5a0' },
            { step: '6', icon: '🌾', label: 'Farmer Gets Advisory', sub: 'Crop suggestions, fertilizer schedule, Hindi TTS', color: '#ef4444' },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 100}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', width: '100%', maxWidth: '550px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `${item.color}20`, border: `2px solid ${item.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', color: item.color, flexShrink: 0 }}>
                  {item.step}
                </div>
                <div style={{ flex: 1, background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                    <strong style={{ fontSize: '0.95rem' }}>{item.label}</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>{item.sub}</div>
                </div>
              </div>
              {i < 5 && (
                <div style={{ width: '2px', height: '20px', background: 'linear-gradient(180deg, #334155, transparent)', margin: '0 auto' }} />
              )}
            </Reveal>
          ))}
        </div>
      </section>

      <DataFlowLine />

      {/* ── SERVICES & INTEGRATIONS ── */}
      <section style={{ padding: '4rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <Reveal>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.5rem' }}>Services & Integrations</h2>
          <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '3rem' }}>Every external service powering the platform</p>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <TechCard icon="📞" name="Twilio + Fast2SMS" role="Multi-provider OTP delivery chain: WhatsApp → Fast2SMS → Twilio → 2Factor fallback" color="#f22f46" delay={0} />
          <TechCard icon="🛒" name="Zustand State" role="Lightweight global state for auth, cart, listings, and orders with localStorage persistence" color="#764abc" delay={80} />
          <TechCard icon="📊" name="Recharts" role="Interactive SVG charts for price forecasting, yield visualization, and mandi trend analysis" color="#ff7300" delay={160} />
          <TechCard icon="🗺️" name="Leaflet + React-Leaflet" role="Open-source maps for consumer-facing delivery tracking and mandi location displays" color="#199900" delay={240} />
          <TechCard icon="🔐" name="Custom Auth" role="Phone-based OTP authentication with session tokens, role-based access (Farmer/Consumer/Wholesaler/Admin)" color="#ec4899" delay={320} />
          <TechCard icon="📄" name="jsPDF" role="Client-side PDF generation for invoices, delivery challans, and order receipts" color="#d63384" delay={400} />
        </div>
      </section>

      <DataFlowLine />

      {/* ── GEMINI ROTATION STRATEGY ── */}
      <section style={{ padding: '4rem 1.5rem', maxWidth: '900px', margin: '0 auto' }}>
        <Reveal>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.5rem' }}>Gemini Key Rotation Engine</h2>
          <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '2rem' }}>How we achieve 100% uptime on the free tier</p>
        </Reveal>
        <Reveal delay={100}>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '2rem', fontFamily: "'Fira Code', 'Consolas', monospace", fontSize: '0.85rem', lineHeight: 1.8, color: '#94a3b8', overflow: 'auto' }}>
            <div><span style={{ color: '#64748b' }}>{'// '}</span><span style={{ color: '#22c55e' }}>5 API Keys × 3 Models = 15 fallback paths</span></div>
            <div style={{ color: '#f59e0b' }}>{'for (key of [KEY_1, KEY_2, KEY_3, KEY_4, KEY_5]) {'}</div>
            <div style={{ paddingLeft: '1.5rem', color: '#60a5fa' }}>{'for (model of ["gemini-2.5-flash", "gemini-2.0-flash-lite", "gemini-2.0-flash"]) {'}</div>
            <div style={{ paddingLeft: '3rem' }}><span style={{ color: '#c084fc' }}>try</span> {'{ result = await genAI(key, model); '}<span style={{ color: '#22c55e' }}>return result;</span> {'}'}</div>
            <div style={{ paddingLeft: '3rem' }}><span style={{ color: '#ef4444' }}>catch</span>{' { '}<span style={{ color: '#64748b' }}>// 429 or 404 → try next</span>{' }'}</div>
            <div style={{ paddingLeft: '1.5rem', color: '#60a5fa' }}>{'}'}</div>
            <div style={{ color: '#f59e0b' }}>{'}'}</div>
            <div style={{ marginTop: '0.5rem', color: '#22c55e' }}>{'// Result: Near-zero chance of total failure 🚀'}</div>
          </div>
        </Reveal>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <Reveal>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', background: 'linear-gradient(135deg, #22c55e, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Built for Bharat. Powered by AI.
          </h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>From field mapping to Gemini-powered yield prediction — everything a farmer needs.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{ background: '#22c55e', color: '#020617', padding: '0.75rem 2rem', borderRadius: '99px', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem' }}>
              ← Back to AgriConnect
            </Link>
            <Link href="/farmer/my-fields" style={{ background: '#1e293b', color: '#e2e8f0', padding: '0.75rem 2rem', borderRadius: '99px', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem', border: '1px solid #334155' }}>
              🛰️ Try AI Yield Analysis
            </Link>
          </div>
        </Reveal>
      </section>

      <footer style={{ borderTop: '1px solid #1e293b', padding: '2rem 1.5rem', textAlign: 'center', fontSize: '0.8rem', color: '#475569' }}>
        © 2026 AgriConnect · BGI Hackathon · Built with ❤️ for Indian Farmers
      </footer>
    </div>
  );
}
