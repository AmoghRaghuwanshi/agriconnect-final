'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import DashboardNav from '@/components/shared/DashboardNav';

interface WeatherDay { date: string; day: string; temp_max: number; temp_min: number; humidity: number; rain_mm: number; rain_prob: number; wind_kmh: number; wind_dir: string; uv: number; condition: string; icon: string; farming_tip: string; }
interface WeatherData { city: string; lat: number; lon: number; current: { temp: number; feels_like: number; humidity: number; wind_kmh: number; wind_dir: string; rain_mm: number; uv: number; condition: string; icon: string; }; daily: WeatherDay[]; farming_summary: string; farming_summary_hi: string; rain_48h: { hour: string; prob: number; rain_mm: number }[]; rain_48h_max_prob: number; rain_48h_total_mm: number; }
interface ChatMsg { role: 'user' | 'bot'; text: string; ts: number; }
type SR = { lang: string; interimResults: boolean; continuous: boolean; start(): void; stop(): void; abort(): void; onresult: ((e: { results: { [k: number]: { [k: number]: { transcript: string } }; length: number } }) => void) | null; onerror: ((e: { error: string }) => void) | null; onend: (() => void) | null; };

const uvLabel = (u: number) => u <= 2 ? 'Low' : u <= 5 ? 'Moderate' : u <= 7 ? 'High' : 'Very High';
const uvColor = (u: number) => u <= 2 ? '#22c55e' : u <= 5 ? '#eab308' : u <= 7 ? '#f97316' : '#ef4444';

export default function WeatherPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('Bhopal');
  const [cityInput, setCityInput] = useState('');
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([{ role: 'bot', text: 'Namaste! 🌾 Main Krishi Mitra hun — aapka mausam salahkaar. Mausam se judi koi bhi baat pucho, bolke ya likhke!', ts: Date.now() }]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<SR | null>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted && (!isAuthenticated || user?.role !== 'FARMER')) router.push('/auth/farmer'); }, [mounted, isAuthenticated, user, router]);

  const fetchWeather = useCallback(async (c: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(c)}`);
      if (!res.ok) throw new Error();
      const data = await res.json() as WeatherData;
      setWeather(data); setCity(data.city); setSelectedDay(0);
    } catch { /* */ }
    setLoading(false);
  }, []);

  const [detectingLoc, setDetectingLoc] = useState(false);

  const fetchByCoords = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      if (!res.ok) throw new Error();
      const data = await res.json() as WeatherData;
      setWeather(data); setCity(data.city); setSelectedDay(0);
    } catch { /* */ }
    setLoading(false); setDetectingLoc(false);
  }, []);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) { fetchWeather('Bhopal'); return; }
    setDetectingLoc(true);
    navigator.geolocation.getCurrentPosition(
      pos => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
      () => { setDetectingLoc(false); fetchWeather('Bhopal'); },
      { timeout: 8000 }
    );
  }, [fetchWeather, fetchByCoords]);

  const handleCitySearch = useCallback((input: string) => {
    const c = input.trim();
    if (!c) return;
    setCityInput('');
    fetchWeather(c);
  }, [fetchWeather]);

  // Auto-detect location on mount
  useEffect(() => { if (mounted) detectLocation(); }, [mounted]); // eslint-disable-line

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMsgs]);

  const getWeatherCtx = useCallback(() => {
    if (!weather) return 'No weather data';
    const c = weather.current;
    const f = weather.daily.slice(0, 3).map(d => `${d.day}: ${d.temp_min}-${d.temp_max}°C, ${d.condition}, Rain ${d.rain_mm}mm (${d.rain_prob}%), Humidity ${d.humidity}%`).join('\n');
    return `Location: ${weather.city}\nCurrent: ${c.temp}°C (feels ${c.feels_like}°C), ${c.condition}, Humidity ${c.humidity}%, Wind ${c.wind_kmh}km/h ${c.wind_dir}, Rain ${c.rain_mm}mm, UV ${c.uv}\n3-Day:\n${f}\nFarming: ${weather.farming_summary}`;
  }, [weather]);

  const speakText = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    setIsSpeaking(true);
    // Strip emojis so TTS doesn't read them as words
    const clean = text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').trim();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = 'hi-IN'; u.rate = 0.9;
    u.onend = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }, []);

  const sendChat = useCallback(async (text: string) => {
    if (!text.trim() || chatLoading) return;
    const msg = text.trim();
    setChatMsgs(p => [...p, { role: 'user', text: msg, ts: Date.now() }]);
    setChatInput(''); setChatLoading(true);
    try {
      const res = await fetch('/api/weather/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: msg, weather_context: getWeatherCtx(), city }) });
      const data = await res.json();
      const ans = data.answer || 'Maaf kijiye, abhi jawab nahi mil raha. Thodi der mein try karo.';
      setChatMsgs(p => [...p, { role: 'bot', text: ans, ts: Date.now() }]);
      speakText(ans);
    } catch { setChatMsgs(p => [...p, { role: 'bot', text: 'Network error — dobara try karo.', ts: Date.now() }]); }
    setChatLoading(false);
  }, [chatLoading, getWeatherCtx, city, speakText]);

  const toggleListen = useCallback(() => {
    if (isListening) { recRef.current?.stop(); setIsListening(false); return; }
    const SRC = (window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    if (!SRC) return;
    const r = new (SRC as new () => SR)();
    r.lang = 'hi-IN'; r.interimResults = false; r.continuous = false;
    r.onresult = e => { const t = e.results[e.results.length - 1][0].transcript; if (t) sendChat(t); };
    r.onerror = () => setIsListening(false);
    r.onend = () => setIsListening(false);
    recRef.current = r; r.start(); setIsListening(true);
  }, [isListening, sendChat]);

  const stopSpeaking = useCallback(() => { window.speechSynthesis?.cancel(); setIsSpeaking(false); }, []);

  if (!mounted || !user) return null;
  const w = weather;
  const sel = w?.daily[selectedDay];

  const quickQ = ['Kya aaj spray kar sakta hu?', 'Buvaai kab karu?', 'Sinchai ki zaroorat hai?', 'Katai ka sahi time?'];

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingBottom: '2rem' }}>
      <DashboardNav />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '0', minHeight: 'calc(100vh - 56px)' }}>

        {/* ═══ LEFT: Weather ═══ */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto' }}>
          <Link href="/farmer/dashboard" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '0.5rem', display: 'inline-block' }}>← Dashboard</Link>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.2rem' }}>🌦️ Weather · मौसम</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>Farm-focused weather with AI advisor</p>

          {/* City Search */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <input value={cityInput} onChange={e => setCityInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleCitySearch(cityInput); }} placeholder={`📍 ${city} — type new city...`} style={{ flex: 1, minWidth: 150, padding: '0.5rem 0.9rem', borderRadius: 12, border: '1.5px solid var(--border)', fontSize: '0.85rem', fontFamily: 'inherit', background: 'var(--bg-card)' }} />
            <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: 12 }} onClick={() => handleCitySearch(cityInput)}>Search</button>
            <button onClick={detectLocation} disabled={detectingLoc} style={{ padding: '0.5rem 0.75rem', borderRadius: 12, border: '1.5px solid var(--border)', background: detectingLoc ? 'var(--green-50)' : 'var(--bg-card)', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit', fontWeight: 600, color: 'var(--green-900)', display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'all 0.15s' }}>
              {detectingLoc ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Detecting...</> : '📍 Auto'}
            </button>
          </div>

          {loading && <div style={{ display: 'grid', gap: '1rem' }}>{[200, 80, 120].map((h, i) => <div key={i} className="skeleton" style={{ height: h, borderRadius: 16 }} />)}</div>}

          {w && !loading && (
            <div className="animate-fade-in-up" style={{ display: 'grid', gap: '1rem' }}>

              {/* Current Weather Hero */}
              <div className="card" style={{ padding: '1.75rem', color: '#fff', position: 'relative', overflow: 'hidden', background: w.current.rain_mm > 0 ? 'linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%)' : w.current.temp > 38 ? 'linear-gradient(135deg, #9a3412 0%, #c2410c 100%)' : 'linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)', border: 'none' }}>
                <div style={{ position: 'absolute', top: -20, right: -20, fontSize: '8rem', opacity: 0.08, pointerEvents: 'none' }}>{w.current.icon}</div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.7, marginBottom: '0.75rem' }}>📍 {w.city} · Right Now</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '2.5rem' }}>{w.current.icon}</span>
                    <div>
                      <div style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1, fontFamily: "var(--font-outfit, 'Outfit')" }}>{w.current.temp}°</div>
                      <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>Feels {w.current.feels_like}° · {w.current.condition}</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                    {[
                      { icon: '💧', label: 'Humidity', val: `${w.current.humidity}%` },
                      { icon: '💨', label: 'Wind', val: `${w.current.wind_kmh} km/h ${w.current.wind_dir}` },
                      { icon: '🌧️', label: 'Rain', val: `${w.current.rain_mm} mm` },
                      { icon: '☀️', label: 'UV Index', val: `${w.current.uv}` },
                    ].map(s => (
                      <div key={s.label} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.5rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '1rem' }}>{s.icon}</div>
                        <div style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: '0.15rem' }}>{s.label}</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{s.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Farming Summary */}
              <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid var(--green-600)', background: 'linear-gradient(135deg, var(--green-50), #fff)' }}>
                <div className="label-cap" style={{ margin: '0 0 0.4rem' }}>🌾 Farming Advice · खेती सलाह</div>
                <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--green-900)', lineHeight: 1.5, margin: 0 }}>{w.farming_summary}</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0.25rem 0 0' }}>{w.farming_summary_hi}</p>
              </div>

              {/* ── 48-Hour Rain Meter ────────────────────────────── */}
              <div className="card" style={{ padding: '1.25rem', overflow: 'hidden' }}>
                <div className="label-cap" style={{ margin: '0 0 0.75rem' }}>🌧️ Rain Forecast · 48 घंटे बारिश</div>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Circular Gauge */}
                  <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
                    <svg viewBox="0 0 120 120" style={{ width: 120, height: 120, transform: 'rotate(-90deg)' }}>
                      <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border)" strokeWidth="10" />
                      <circle cx="60" cy="60" r="52" fill="none"
                        stroke={w.rain_48h_max_prob > 70 ? '#3b82f6' : w.rain_48h_max_prob > 40 ? '#eab308' : '#22c55e'}
                        strokeWidth="10" strokeLinecap="round"
                        strokeDasharray={`${(w.rain_48h_max_prob / 100) * 327} 327`}
                        style={{ transition: 'stroke-dasharray 1s ease' }}
                      />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1, color: w.rain_48h_max_prob > 70 ? '#3b82f6' : w.rain_48h_max_prob > 40 ? '#eab308' : '#22c55e', fontFamily: "var(--font-outfit, 'Outfit')" }}>{w.rain_48h_max_prob}%</span>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Max Chance</span>
                    </div>
                  </div>

                  {/* Stats + Advice */}
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.6rem' }}>
                      <div style={{ padding: '0.5rem 0.6rem', background: 'var(--bg-muted)', borderRadius: 8 }}>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Peak Probability</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: w.rain_48h_max_prob > 60 ? '#3b82f6' : 'var(--text-primary)' }}>{w.rain_48h_max_prob}%</div>
                      </div>
                      <div style={{ padding: '0.5rem 0.6rem', background: 'var(--bg-muted)', borderRadius: 8 }}>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Expected</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{w.rain_48h_total_mm} mm</div>
                      </div>
                    </div>
                    <div style={{ padding: '0.5rem 0.65rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 500, background: w.rain_48h_max_prob > 60 ? '#dbeafe' : w.rain_48h_max_prob > 30 ? '#fef3c7' : '#dcfce7', color: w.rain_48h_max_prob > 60 ? '#1e40af' : w.rain_48h_max_prob > 30 ? '#92400e' : '#166534' }}>
                      {w.rain_48h_max_prob > 70 ? '⛈️ Heavy rain likely — avoid spraying, ensure drainage' : w.rain_48h_max_prob > 40 ? '🌦️ Moderate rain chance — plan field work carefully' : w.rain_48h_max_prob > 15 ? '🌤️ Light showers possible — generally safe for work' : '☀️ Dry period — good time for spraying & sowing'}
                    </div>
                  </div>
                </div>

                {/* Hourly Bar Chart */}
                <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, minWidth: 500, height: 60 }}>
                    {(w.rain_48h || []).map((h, i) => (
                      <div key={i} title={`${h.hour}: ${h.prob}% · ${h.rain_mm}mm`} style={{ flex: 1, minWidth: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <div style={{ width: '100%', height: Math.max(2, (h.prob / 100) * 50), borderRadius: '3px 3px 0 0', background: h.prob > 70 ? '#3b82f6' : h.prob > 40 ? '#60a5fa' : h.prob > 15 ? '#93c5fd' : '#e2e8f0', transition: 'height 0.3s ease' }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    <span>Now</span><span>+12h</span><span>+24h</span><span>+36h</span><span>+48h</span>
                  </div>
                </div>
              </div>

              {/* 7-Day Cards */}
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.6rem' }}>7-Day Forecast · 7 दिन का मौसम</h2>
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                  {w.daily.map((d, i) => (
                    <button key={d.date} onClick={() => setSelectedDay(i)} style={{ flex: '0 0 auto', minWidth: 85, padding: '0.75rem 0.5rem', borderRadius: 14, border: selectedDay === i ? '2px solid var(--green-600)' : '1.5px solid var(--border)', background: selectedDay === i ? 'var(--green-50)' : 'var(--bg-card)', cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 600, color: selectedDay === i ? 'var(--green-900)' : 'var(--text-muted)' }}>{i === 0 ? 'Today' : d.day}</div>
                      <div style={{ fontSize: '1.3rem', margin: '0.2rem 0' }}>{d.icon}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{d.temp_max}°</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{d.temp_min}°</div>
                      {d.rain_prob > 20 && <div style={{ fontSize: '0.6rem', color: '#3b82f6', marginTop: '0.15rem' }}>💧{d.rain_prob}%</div>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Day Detail */}
              {sel && (
                <div className="card animate-fade-in" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{selectedDay === 0 ? 'Today' : sel.day} · {new Date(sel.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                    <span style={{ fontSize: '1.5rem' }}>{sel.icon}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem', marginBottom: '0.75rem' }}>
                    {[
                      { l: '🌡️ Temp', v: `${sel.temp_min}° – ${sel.temp_max}°` },
                      { l: '💧 Humidity', v: `${sel.humidity}%` },
                      { l: '🌧️ Rain', v: `${sel.rain_mm}mm (${sel.rain_prob}%)` },
                      { l: '💨 Wind', v: `${sel.wind_kmh} km/h ${sel.wind_dir}` },
                      { l: '☀️ UV', v: <span style={{ color: uvColor(sel.uv) }}>{sel.uv} ({uvLabel(sel.uv)})</span> },
                      { l: '🌤️ Condition', v: sel.condition },
                    ].map(r => (
                      <div key={String(r.l)} style={{ padding: '0.4rem 0.6rem', background: 'var(--bg-muted)', borderRadius: 8, fontSize: '0.8rem' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{r.l}</div>
                        <div style={{ fontWeight: 600, marginTop: '0.1rem' }}>{r.v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '0.6rem 0.8rem', background: 'var(--green-50)', borderRadius: 10, fontSize: '0.82rem', color: 'var(--green-900)', fontWeight: 500 }}>
                    🌾 {sel.farming_tip}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══ RIGHT: Krishi Mitra Chat ═══ */}
        <div style={{ borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', height: 'calc(100vh - 56px)', position: 'sticky', top: 56 }}>
          {/* Header */}
          <div style={{ padding: '1rem 1.25rem', background: 'linear-gradient(135deg, #14532d, #166534)', color: '#fff', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🌾</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>Krishi Mitra · कृषि मित्र</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>AI Weather Advisor for Farmers</div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {chatMsgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '88%', padding: '0.6rem 0.9rem', borderRadius: 16, background: m.role === 'user' ? 'var(--green-900)' : 'var(--bg-muted)', color: m.role === 'user' ? '#fff' : 'var(--text-primary)', fontSize: '0.85rem', lineHeight: 1.55, borderBottomRightRadius: m.role === 'user' ? 4 : 16, borderBottomLeftRadius: m.role === 'bot' ? 4 : 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  {m.text}
                </div>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.15rem', padding: '0 0.3rem' }}>{new Date(m.ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
            {chatLoading && <div style={{ alignSelf: 'flex-start', padding: '0.6rem 0.9rem', borderRadius: 16, background: 'var(--bg-muted)', fontSize: '0.85rem' }}><span style={{ animation: 'pulse 1s infinite' }}>🌾 सोच रहा हूं...</span></div>}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Questions */}
          <div style={{ padding: '0.4rem 0.75rem', display: 'flex', gap: '0.35rem', overflowX: 'auto', flexShrink: 0, borderTop: '1px solid var(--border)' }}>
            {quickQ.map(q => (
              <button key={q} onClick={() => sendChat(q)} style={{ padding: '0.3rem 0.6rem', borderRadius: 9999, border: '1px solid var(--border)', background: 'var(--bg-base)', fontSize: '0.7rem', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit', color: 'var(--text-secondary)', transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--green-50)'; e.currentTarget.style.borderColor = 'var(--green-600)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-base)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div style={{ padding: '0.6rem 0.75rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.4rem', alignItems: 'center', flexShrink: 0, background: 'var(--bg-base)' }}>
            <button onClick={isSpeaking ? stopSpeaking : toggleListen} style={{ width: 42, height: 42, borderRadius: '50%', border: 'none', cursor: 'pointer', background: isListening ? '#dc2626' : isSpeaking ? '#7c3aed' : 'var(--green-900)', color: '#fff', fontSize: '1.1rem', flexShrink: 0, transition: 'all 0.2s', animation: isListening ? 'micPulse 1.5s infinite' : undefined, boxShadow: isListening ? '0 0 0 4px rgba(220,38,38,0.2)' : isSpeaking ? '0 0 0 4px rgba(124,58,237,0.2)' : 'none' }} title={isListening ? 'Listening...' : isSpeaking ? 'Stop speaking' : 'Tap to speak in Hindi'}>
              {isListening ? '⏹' : isSpeaking ? '🔊' : '🎤'}
            </button>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendChat(chatInput); }} placeholder="पूछो... Ask about weather..." style={{ flex: 1, padding: '0.55rem 0.85rem', borderRadius: 12, border: '1.5px solid var(--border)', fontSize: '0.85rem', fontFamily: 'inherit', background: 'var(--bg-card)', outline: 'none' }} />
            <button onClick={() => sendChat(chatInput)} disabled={!chatInput.trim() || chatLoading} style={{ width: 42, height: 42, borderRadius: '50%', border: 'none', background: chatInput.trim() ? 'var(--green-900)' : 'var(--bg-muted)', color: chatInput.trim() ? '#fff' : 'var(--text-muted)', fontSize: '1.1rem', cursor: chatInput.trim() ? 'pointer' : 'default', flexShrink: 0, transition: 'all 0.15s' }}>➤</button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes micPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.4); } 50% { box-shadow: 0 0 0 14px rgba(220,38,38,0); } }
        @media (max-width: 768px) {
          main > div:first-of-type { grid-template-columns: 1fr !important; }
          main > div:first-of-type > div:last-child { position: fixed !important; bottom: 0; left: 0; right: 0; height: 50vh !important; z-index: 100; border-top: 2px solid var(--border); border-left: none !important; }
        }
      `}</style>
    </main>
  );
}
