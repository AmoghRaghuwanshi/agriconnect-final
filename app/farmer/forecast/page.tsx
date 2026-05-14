'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import DashboardNav from '@/components/shared/DashboardNav';

/* ── Types (matching API response) ─────────────────────────────────────────── */
interface ForecastFactor {
  label: string;
  label_hi: string;
  value: string;
  impact: 'bullish' | 'bearish' | 'neutral';
  icon: string;
  detail: string;
}

interface ForecastData {
  crop_name: string;
  variety: string | null;
  region: string;
  current_price_range: { min: number; max: number; unit: string };
  forecast_7d: { min: number; max: number; trend: 'up' | 'down' | 'stable' };
  forecast_30d: { min: number; max: number; trend: 'up' | 'down' | 'stable' };
  forecast_90d: { min: number; max: number; trend: 'up' | 'down' | 'stable' };
  confidence: number;
  factors: ForecastFactor[];
  recommendation: string;
  recommendation_hi: string;
  best_sell_window: string;
  best_sell_window_hi: string;
  source: string;
  cached?: boolean;
  cached_at?: string;
}

/* ── Supported crops ───────────────────────────────────────────────────────── */
const CROPS = [
  { name: 'Wheat', hindi: 'गेहूं', emoji: '🌾', category: 'Grains' },
  { name: 'Rice', hindi: 'चावल', emoji: '🌾', category: 'Grains' },
  { name: 'Maize', hindi: 'मक्का', emoji: '🌽', category: 'Grains' },
  { name: 'Barley', hindi: 'जौ', emoji: '🌾', category: 'Grains' },
  { name: 'Onion', hindi: 'प्याज', emoji: '🧅', category: 'Vegetables' },
  { name: 'Tomato', hindi: 'टमाटर', emoji: '🍅', category: 'Vegetables' },
  { name: 'Potato', hindi: 'आलू', emoji: '🥔', category: 'Vegetables' },
  { name: 'Soybean', hindi: 'सोयाबीन', emoji: '🫘', category: 'Pulses' },
  { name: 'Mustard', hindi: 'सरसों', emoji: '🌻', category: 'Oilseeds' },
  { name: 'Cotton', hindi: 'कपास', emoji: '🏵️', category: 'Fibers' },
  { name: 'Sugarcane', hindi: 'गन्ना', emoji: '🎋', category: 'Cash Crops' },
  { name: 'Turmeric', hindi: 'हल्दी', emoji: '🟡', category: 'Spices' },
  { name: 'Chili', hindi: 'मिर्च', emoji: '🌶️', category: 'Spices' },
];

/* ── Trend helpers ─────────────────────────────────────────────────────────── */
const trendIcon = (t: string) => t === 'up' ? '📈' : t === 'down' ? '📉' : '➡️';
const trendColor = (t: string) => t === 'up' ? 'var(--green-700)' : t === 'down' ? '#C1121F' : 'var(--text-muted)';
const trendLabel = (t: string) => t === 'up' ? 'Bullish' : t === 'down' ? 'Bearish' : 'Stable';
const impactBg = (i: string) => i === 'bullish' ? 'var(--green-100)' : i === 'bearish' ? '#FEE2E2' : '#F3F4F6';
const impactColor = (i: string) => i === 'bullish' ? 'var(--green-900)' : i === 'bearish' ? '#991B1B' : '#374151';
const impactLabel = (i: string) => i === 'bullish' ? '↑ Price Up' : i === 'bearish' ? '↓ Price Down' : '— Neutral';

/* ── Source badge ──────────────────────────────────────────────────────────── */
function SourceBadge({ source, cached, cachedAt }: { source: string; cached?: boolean; cachedAt?: string }) {
  const isCached = cached || source.includes('cached');
  const isGemini = source.includes('gemini');
  const isGroq = source.includes('groq');
  const isSmart = source.includes('smart');
  const bg = isCached ? '#EDE9FE' : isGemini ? 'var(--green-100)' : isGroq ? '#DBEAFE' : isSmart ? '#DBEAFE' : '#F3F4F6';
  const color = isCached ? '#5B21B6' : isGemini ? 'var(--green-900)' : isGroq ? '#1E40AF' : isSmart ? '#1E40AF' : '#374151';
  const baseLabel = isGemini ? 'Gemini AI ✓' : isGroq ? 'Groq AI ✓' : isSmart ? '📊 Smart Analysis ✓' : 'Analysis';
  const label = isCached ? `⚡ Cached · ${baseLabel}` : baseLabel;

  const timeStr = cachedAt ? new Date(cachedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
      <span style={{ background: bg, color, padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700 }}>
        {label}
      </span>
      {isCached && timeStr && (
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Updated at {timeStr} IST</span>
      )}
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────────────────────── */
export default function ForecastPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedFactor, setExpandedFactor] = useState<number | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // Auth guard
  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'FARMER')) {
      router.push('/auth/farmer');
    }
  }, [mounted, isAuthenticated, user, router]);

  // Auto-select crop from URL params (voice command integration)
  useEffect(() => {
    if (mounted && searchParams) {
      const cropParam = searchParams.get('crop');
      if (cropParam) {
        setSelectedCrop(cropParam);
      }
    }
  }, [mounted, searchParams]);

  // Auto-fetch when crop is set from URL
  useEffect(() => {
    if (selectedCrop && !forecast && !loading && mounted) {
      const cropParam = searchParams?.get('crop');
      if (cropParam) {
        fetchForecast(selectedCrop);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCrop, mounted]);

  const fetchForecast = useCallback(async (crop: string) => {
    if (!crop) return;
    setLoading(true);
    setError('');
    setForecast(null);
    setExpandedFactor(null);

    try {
      const res = await fetch('/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crop_name: crop, region: 'India' }),
      });

      if (!res.ok) throw new Error('Forecast failed');
      const data = await res.json() as ForecastData;
      setForecast(data);
    } catch {
      setError('Forecast unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  if (!mounted || !user) return null;

  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingBottom: '5rem' }}>
      <DashboardNav />
      <div className="container" style={{ padding: '1.75rem 1.5rem' }}>

        {/* ── Page Header ───────────────────────────────────────────── */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link href="/farmer/dashboard" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.75rem' }}>
            ← Dashboard
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.3rem', lineHeight: 1.2 }}>
                📊 Price Forecast · मूल्य पूर्वानुमान
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                AI-powered price predictions · {today}
              </p>
            </div>
            {forecast && <SourceBadge source={forecast.source} cached={forecast.cached} cachedAt={forecast.cached_at} />}
          </div>
        </div>

        {/* ── Crop Selector ─────────────────────────────────────────── */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="label-cap" style={{ marginBottom: '0.75rem' }}>Select Crop · फसल चुनें</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {CROPS.map(c => (
              <button
                key={c.name}
                onClick={() => { setSelectedCrop(c.name); setForecast(null); }}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  border: selectedCrop === c.name ? '2px solid var(--green-900)' : '1.5px solid var(--border)',
                  background: selectedCrop === c.name ? 'var(--green-900)' : 'var(--bg-card)',
                  color: selectedCrop === c.name ? '#fff' : 'var(--text-primary)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                }}
              >
                <span>{c.emoji}</span>
                <span>{c.name}</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>({c.hindi})</span>
              </button>
            ))}
          </div>

          <button
            className="btn btn-primary"
            disabled={!selectedCrop || loading}
            onClick={() => fetchForecast(selectedCrop)}
            style={{ minWidth: 200 }}
          >
            {loading ? (
              <><span className="spinner" style={{ width: 16, height: 16 }} /> Analyzing...</>
            ) : (
              <>✨ Generate Forecast</>
            )}
          </button>
        </div>

        {/* ── Error State ───────────────────────────────────────────── */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── Loading Skeleton ──────────────────────────────────────── */}
        {loading && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: i === 1 ? 180 : 120, borderRadius: 16 }} />
            ))}
          </div>
        )}

        {/* ── Forecast Results ──────────────────────────────────────── */}
        {forecast && !loading && (
          <div className="animate-fade-in-up" style={{ display: 'grid', gap: '1.25rem' }}>

            {/* ── Current Price + Confidence ────────────────────────── */}
            <div className="card" style={{
              padding: '2rem',
              background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
              color: '#fff',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', background: 'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 1 }}>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.8, marginBottom: '0.5rem' }}>
                    Current Market Price
                  </div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, fontFamily: "var(--font-outfit, 'Outfit'), sans-serif" }}>
                    ₹{forecast.current_price_range.min} – ₹{forecast.current_price_range.max}
                  </div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.4rem' }}>
                    per kg · {forecast.crop_name}{forecast.variety ? ` (${forecast.variety})` : ''} · {forecast.region}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: `conic-gradient(rgba(255,255,255,0.9) ${forecast.confidence * 100}%, rgba(255,255,255,0.15) 0%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--green-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem' }}>
                      {Math.round(forecast.confidence * 100)}%
                    </div>
                  </div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.3rem' }}>Confidence</div>
                </div>
              </div>
            </div>

            {/* ── Forecast Timeline (7d / 30d / 90d) ───────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {[
                { label: '7-Day Forecast', hindi: '7 दिन', data: forecast.forecast_7d },
                { label: '30-Day Forecast', hindi: '30 दिन', data: forecast.forecast_30d },
                { label: '90-Day Forecast', hindi: '90 दिन', data: forecast.forecast_90d },
              ].map(f => (
                <div key={f.label} className="card" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute', top: 0, right: 0, width: 4, height: '100%',
                    background: trendColor(f.data.trend),
                    borderRadius: '0 16px 16px 0',
                  }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{f.label}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{f.hindi}</span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "var(--font-outfit, 'Outfit'), sans-serif" }}>
                    ₹{f.data.min} – ₹{f.data.max}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.4rem' }}>
                    <span>{trendIcon(f.data.trend)}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: trendColor(f.data.trend) }}>
                      {trendLabel(f.data.trend)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* ── AI Recommendation ────────────────────────────────── */}
            <div className="card" style={{
              padding: '1.5rem', border: '2px solid var(--green-100)',
              background: 'linear-gradient(135deg, var(--green-50) 0%, #fff 100%)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.3rem' }}>💡</span>
                <span className="label-cap" style={{ margin: 0 }}>AI Recommendation · AI सलाह</span>
              </div>
              <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--green-900)', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                {forecast.recommendation}
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {forecast.recommendation_hi}
              </p>
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Best Sell Window</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--green-900)' }}>{forecast.best_sell_window}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>बेचने का सही समय</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--green-900)' }}>{forecast.best_sell_window_hi}</div>
                </div>
              </div>
            </div>

            {/* ── Market Factors Grid ──────────────────────────────── */}
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
                Market Analysis · बाज़ार विश्लेषण
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '0.75rem' }}>
                {forecast.factors.map((f, i) => (
                  <div
                    key={i}
                    className="card"
                    onClick={() => setExpandedFactor(expandedFactor === i ? null : i)}
                    style={{
                      padding: '1rem 1.25rem', cursor: 'pointer',
                      borderLeft: `4px solid ${impactColor(f.impact)}`,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>{f.icon}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{f.label}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.label_hi}</div>
                        </div>
                      </div>
                      <span style={{
                        background: impactBg(f.impact), color: impactColor(f.impact),
                        padding: '0.15rem 0.5rem', borderRadius: '9999px',
                        fontSize: '0.65rem', fontWeight: 700, whiteSpace: 'nowrap',
                      }}>
                        {impactLabel(f.impact)}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.4 }}>
                      {f.value}
                    </p>
                    {expandedFactor === i && (
                      <div className="animate-fade-in" style={{
                        marginTop: '0.75rem', paddingTop: '0.75rem',
                        borderTop: '1px solid var(--border)',
                        fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5,
                      }}>
                        {f.detail}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Disclaimer ──────────────────────────────────────── */}
            <div style={{
              padding: '1rem 1.25rem', borderRadius: 12,
              background: 'var(--bg-muted)', border: '1px solid var(--border)',
              fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6,
            }}>
              ⚠️ <strong>Disclaimer:</strong> This forecast is AI-generated based on market analysis and historical data. Actual prices may vary. Use this as guidance — not financial advice. Always check local mandi rates before selling.
              <br />
              <span style={{ color: 'var(--olive-700)' }}>
                ⚠️ यह पूर्वानुमान AI द्वारा तैयार है। वास्तविक मूल्य भिन्न हो सकते हैं। बेचने से पहले स्थानीय मंडी भाव ज़रूर जाँचें।
              </span>
            </div>
          </div>
        )}

        {/* ── Empty state when no crop selected ────────────────────── */}
        {!forecast && !loading && !error && (
          <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📊</div>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              Select a crop to see price forecast
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto', lineHeight: 1.6 }}>
              फसल चुनें और AI-powered मूल्य पूर्वानुमान देखें — या बोलें: <strong>&quot;गेहूं का भाव बताओ&quot;</strong>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
