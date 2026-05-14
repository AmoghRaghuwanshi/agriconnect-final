'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardNav from '@/components/shared/DashboardNav';
import { useParams, useRouter } from 'next/navigation';

export default function YieldAnalysisPage() {
  const { id: fieldId } = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null);

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: string; text: string}[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // TTS state
  const [speaking, setSpeaking] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalysis = async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/analysis/yield', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fieldId, refresh })
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || 'Analysis failed');
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!fieldId) return;
    fetchAnalysis();
  }, [fieldId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // --- Speak in Hindi using browser TTS ---
  const speakHindi = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Your browser does not support Text-to-Speech.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.9;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    // Try to find a Hindi voice
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v => v.lang.startsWith('hi'));
    if (hindiVoice) utterance.voice = hindiVoice;

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  // --- Chatbot ---
  const buildFieldContext = () => {
    if (!data) return '';
    const { analysis, context } = data;
    const { soil, weather, field } = context;
    return `Field: ${field.name}, Area: ${field.area_ha}ha, Lat/Lng: ${field.center_lat}/${field.center_lng}
Soil: pH=${soil.pH}, N=${soil.nitrogen_gkg}g/kg, OC=${soil.organicCarbon_gkg}g/kg, Clay=${soil.clay_pct}%, Sand=${soil.sand_pct}%
Weather: MaxTemp=${weather.maxTempNextWeek}°C, Rain=${weather.totalRainfallNext14Days}mm, Humidity=${weather.avgHumidity}%, DroughtRisk=${weather.droughtRisk}
NDVI: ${weather.simulatedNDVI} (${weather.ndviStatus})
Predicted Yield: ${analysis.predictedYieldQtlHa} qtl/ha
Best Crops: ${analysis.bestCrops?.map((c: any) => c.name).join(', ') || 'N/A'}`;
  };

  const sendChatMsg = async () => {
    if (!chatMsg.trim() || chatLoading) return;
    const userMsg = chatMsg.trim();
    setChatMsg('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/analysis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMsg,
          fieldContext: buildFieldContext(),
          history: chatHistory.slice(-6), // Last 3 exchanges
        }),
      });
      const json = await res.json();
      setChatHistory(prev => [...prev, { role: 'bot', text: json.answer || json.error || 'No response' }]);
    } catch {
      setChatHistory(prev => [...prev, { role: 'bot', text: 'Network error, please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  // ---- RENDER ----

  if (loading) {
    return (
      <div style={{ background: 'var(--bg-base)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <DashboardNav title="AI Yield Intelligence" role="farmer" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid var(--primary-100)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          <h2 style={{ fontWeight: 600, fontSize: '1.25rem' }}>Running AI Analysis...</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Fetching live SoilGrids & Open-Meteo data for your field...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
        <DashboardNav title="AI Yield Intelligence" role="farmer" />
        <main className="container" style={{ padding: '2rem' }}>
          <div className="alert alert-error">Error: {error}</div>
          <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={() => router.back()}>Go Back</button>
        </main>
      </div>
    );
  }

  const { analysis, context } = data;
  const { soil, weather, field } = context;
  const scoreColor = (score: number) => score >= 80 ? '#16a34a' : score >= 60 ? '#eab308' : '#ef4444';

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', paddingBottom: '4rem' }}>
      <DashboardNav title={`${field.name} — Intelligence`} role="farmer" />

      <main className="container" style={{ padding: '2rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* CACHED BANNER */}
        {data.cached && (
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '0.75rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
            <span style={{ color: '#1e40af' }}>
              💾 Cached analysis from {new Date(data.cachedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
            <button
              onClick={() => fetchAnalysis(true)}
              disabled={refreshing}
              style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '99px', padding: '5px 14px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', opacity: refreshing ? 0.6 : 1 }}
            >
              {refreshing ? '⏳ Refreshing...' : '🔄 Refresh Analysis'}
            </button>
          </div>
        )}

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge" style={{ background: 'var(--primary-50)', color: 'var(--primary)', marginBottom: '0.5rem', display: 'inline-block' }}>Live AI Analysis</span>
            <h1 style={{ fontFamily: 'var(--font-outfit), Outfit, sans-serif', fontWeight: 800, fontSize: '2.5rem', lineHeight: 1.1 }}>
              {analysis.predictedYieldQtlHa} <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>qtl/ha</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Predicted Yield for <strong>{field.name}</strong> • Range: {analysis.confidenceRange} qtl/ha
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: scoreColor(analysis.scores.overall) }}>
              {analysis.scores.overall}<span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>/100</span>
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Overall Score</div>
          </div>
        </div>

        {/* SCORES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Soil Health', score: analysis.scores.soil, icon: '🌱' },
            { label: 'Weather', score: analysis.scores.weather, icon: '☀️' },
            { label: 'Vegetation', score: analysis.scores.vegetation, icon: '🛰️' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '1.75rem' }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: scoreColor(s.score) }}>{s.score}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ===== BEST CROPS SECTION ===== */}
        {analysis.bestCrops && (
          <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', padding: '2rem', borderRadius: '16px', border: '1px solid #bbf7d0', marginBottom: '2rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1rem', color: '#166534' }}>🌾 Best Crops for This Field</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {analysis.bestCrops.map((crop: any, i: number) => (
                <div key={i} style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <strong style={{ fontSize: '1.1rem' }}>{crop.name}</strong>
                    <span style={{ fontSize: '0.8rem', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '99px', fontWeight: 600 }}>{crop.expectedYield}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#4a5568', margin: 0 }}>{crop.reason}</p>
                </div>
              ))}
            </div>
            {analysis.avoidCrops && analysis.avoidCrops.length > 0 && (
              <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                <strong style={{ color: '#991b1b', fontSize: '0.9rem' }}>❌ Avoid:</strong>{' '}
                {analysis.avoidCrops.map((c: any) => `${c.name} (${c.reason})`).join(', ')}
              </div>
            )}
          </div>
        )}

        {/* MAIN GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* ===== FERTILIZER PLAN ===== */}
            {analysis.fertilizerPlan && (
              <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <h3 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1.5rem' }}>🧪 Detailed Fertilizer Schedule</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { label: 'Basal Dose (before sowing)', value: analysis.fertilizerPlan.basal, color: '#7c3aed' },
                    { label: '1st Top Dressing', value: analysis.fertilizerPlan.firstTopDress, color: '#2563eb' },
                    { label: '2nd Top Dressing', value: analysis.fertilizerPlan.secondTopDress, color: '#0891b2' },
                    { label: 'Micronutrients', value: analysis.fertilizerPlan.micronutrients, color: '#d97706' },
                    { label: 'Organic Matter', value: analysis.fertilizerPlan.organic, color: '#16a34a' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div style={{ minWidth: '32px', height: '32px', borderRadius: '50%', background: item.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>{i + 1}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: item.color, textTransform: 'uppercase' }}>{item.label}</div>
                        <div style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== PEST WARNINGS ===== */}
            {analysis.pestWarnings && analysis.pestWarnings.length > 0 && (
              <div style={{ background: '#fffbeb', padding: '2rem', borderRadius: '16px', border: '1px solid #fde68a' }}>
                <h3 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1rem', color: '#92400e' }}>🐛 Pest & Disease Alerts</h3>
                {analysis.pestWarnings.map((p: any, i: number) => (
                  <div key={i} style={{ marginBottom: i < analysis.pestWarnings.length - 1 ? '1rem' : 0, padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid #fde68a' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <strong>{p.pest}</strong>
                      <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '99px', fontWeight: 600, background: p.risk === 'High' ? '#fecaca' : p.risk === 'Medium' ? '#fde68a' : '#bbf7d0', color: p.risk === 'High' ? '#991b1b' : p.risk === 'Medium' ? '#92400e' : '#166534' }}>{p.risk} Risk</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#4a5568', margin: 0 }}>{p.prevention}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ===== AI ADVISORY ===== */}
            <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1.5rem' }}>🧠 Expert Action Plan</h3>
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>Fertilizer Summary</h4>
                <p style={{ lineHeight: 1.6 }}>{analysis.fertilizerRecommendation}</p>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontWeight: 600, color: '#0284c7', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>Irrigation Advisory</h4>
                <p style={{ lineHeight: 1.6 }}>{analysis.irrigationAdvisory}</p>
              </div>
              {analysis.soilHealthTips && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontWeight: 600, color: '#16a34a', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>Soil Health Improvement</h4>
                  <p style={{ lineHeight: 1.6 }}>{analysis.soilHealthTips}</p>
                </div>
              )}

              {/* HINDI ADVISORY WITH SPEAK BUTTON */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontWeight: 600, fontSize: '0.9rem' }}>🗣️ हिंदी सलाह (Hindi Advisory)</h4>
                  <button
                    onClick={() => speaking ? stopSpeaking() : speakHindi(analysis.advisoryHindi)}
                    style={{ background: speaking ? '#ef4444' : 'var(--primary)', color: 'white', border: 'none', borderRadius: '99px', padding: '6px 16px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {speaking ? '⏹ रुकें' : '🔊 सुनें'}
                  </button>
                </div>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>{analysis.advisoryHindi}</p>
              </div>
            </div>

            {/* LIMITING FACTORS */}
            <div style={{ background: '#fef2f2', padding: '2rem', borderRadius: '16px', border: '1px solid #fecaca' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1rem', color: '#991b1b' }}>⚠️ Yield Limiting Factors</h3>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#7f1d1d', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {analysis.limitingFactors.map((f: string, i: number) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          </div>

          {/* SIDEBAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Live Weather</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                <div><strong>Max Temp:</strong><br/>{weather.maxTempNextWeek}°C</div>
                <div><strong>Rainfall:</strong><br/>{weather.totalRainfallNext14Days}mm</div>
                <div><strong>Humidity:</strong><br/>{weather.avgHumidity}%</div>
                <div><strong>Drought:</strong><br/>{weather.droughtRisk}</div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Soil Data</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                <div><strong>pH:</strong><br/>{soil.pH}</div>
                <div><strong>Nitrogen:</strong><br/>{soil.nitrogen_gkg} g/kg</div>
                <div><strong>Organic C:</strong><br/>{soil.organicCarbon_gkg} g/kg</div>
                <div><strong>Clay/Sand:</strong><br/>{soil.clay_pct}%/{soil.sand_pct}%</div>
              </div>
            </div>

            <button className="btn btn-primary" onClick={() => router.push('/farmer/my-fields')} style={{ width: '100%' }}>
              ← Back to My Fields
            </button>
          </div>
        </div>
      </main>

      {/* ===== FLOATING CHATBOT ===== */}
      <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 1000 }}>
        {chatOpen && (
          <div style={{ width: '380px', height: '500px', background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden', marginBottom: '0.75rem' }}>
            {/* Chat Header */}
            <div style={{ background: 'var(--primary)', color: 'white', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>🌾 Krishi Mitra</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Ask anything about this field</div>
              </div>
              <button onClick={() => setChatOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontWeight: 700 }}>✕</button>
            </div>

            {/* Chat Messages */}
            <div style={{ flex: 1, overflow: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {chatHistory.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '2rem 1rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧑‍🌾</div>
                  <p>Namaste! Main Krishi Mitra hun.</p>
                  <p style={{ marginTop: '0.5rem' }}>Apne khet ke baare mein kuch bhi poochiye — fertilizer, pest, irrigation, ya crop selection!</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                    {['Kaun sa khad daalu?', 'Keede se kaise bachaye?', 'Hindi mein batao sab'].map(q => (
                      <button key={q} onClick={() => { setChatMsg(q); }} style={{ background: '#f1f5f9', border: '1px solid var(--border)', borderRadius: '99px', padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer', textAlign: 'left' }}>
                        💬 {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '85%',
                    padding: '0.75rem 1rem',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.role === 'user' ? 'var(--primary)' : '#f1f5f9',
                    color: msg.role === 'user' ? 'white' : 'inherit',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                  }}>
                    {msg.text}
                    {msg.role === 'bot' && (
                      <button onClick={() => speakHindi(msg.text)} style={{ display: 'block', marginTop: '0.5rem', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, padding: 0 }}>
                        🔊 सुनें
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ padding: '0.75rem 1rem', borderRadius: '16px 16px 16px 4px', background: '#f1f5f9', fontSize: '0.9rem' }}>
                    Soch rahi hun... 🤔
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={chatMsg}
                onChange={e => setChatMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChatMsg()}
                placeholder="Apna sawaal poochiye..."
                style={{ flex: 1, padding: '0.6rem 1rem', borderRadius: '99px', border: '1px solid var(--border)', outline: 'none', fontSize: '0.9rem' }}
              />
              <button
                onClick={sendChatMsg}
                disabled={chatLoading || !chatMsg.trim()}
                style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: chatLoading || !chatMsg.trim() ? 0.5 : 1 }}
              >
                ➤
              </button>
            </div>
          </div>
        )}

        {/* FAB Button */}
        <button
          onClick={() => setChatOpen(o => !o)}
          style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '1.5rem', boxShadow: '0 8px 25px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {chatOpen ? '✕' : '💬'}
        </button>
      </div>
    </div>
  );
}
