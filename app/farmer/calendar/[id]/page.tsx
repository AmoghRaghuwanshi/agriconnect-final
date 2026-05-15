'use client';

import { useState, useEffect } from 'react';
import DashboardNav from '@/components/shared/DashboardNav';
import { useParams, useRouter } from 'next/navigation';

const TYPE_COLORS: Record<string, string> = {
  fertilizer: '#7c3aed',
  irrigation: '#0ea5e9',
  pest: '#ef4444',
  sowing: '#22c55e',
  seed: '#10b981',
  tillage: '#8b5cf6',
  harvest: '#d97706',
};

export default function CropCalendarPage() {
  const { id: fieldId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null);
  const [crop, setCrop] = useState('Wheat');
  const [generating, setGenerating] = useState(false);

  const fetchCalendar = async (selectedCrop: string, refresh = false) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/analysis/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fieldId, crop: selectedCrop, refresh }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || 'Failed');
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (fieldId) fetchCalendar(crop);
  }, [fieldId]);

  const handleCropChange = (newCrop: string) => {
    setCrop(newCrop);
    setGenerating(true);
    fetchCalendar(newCrop);
  };

  // ── PDF Download ──
  const downloadPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const cal = data.calendar;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    
    const w = doc.internal.pageSize.getWidth();
    let y = 15;

    // Header
    doc.setFillColor(27, 67, 50);
    doc.rect(0, 0, w, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('AgriConnect Crop Calendar', 15, 18);
    doc.setFontSize(10);
    doc.text(`${cal.crop} (${cal.variety}) • ${data.field.name} • ${cal.totalDurationDays} days`, 15, 27);
    
    y = 42;
    doc.setTextColor(0, 0, 0);

    // Summary row
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Sowing: ${cal.sowingWindow}  |  Harvest: ${cal.harvestWindow}  |  Irrigations: ${cal.totalIrrigations}  |  Yield: ${cal.expectedYield}  |  Cost: ${cal.estimatedCostPerHa}`, 15, y);
    y += 8;

    // Phases
    for (const phase of cal.phases) {
      // Check if we need a new page
      if (y + 10 + phase.tasks.length * 6 > 280) {
        doc.addPage();
        y = 15;
      }

      doc.setFontSize(12);
      doc.setTextColor(30, 30, 30);
      doc.text(`${phase.name}`, 15, y);
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`${phase.startDate} → ${phase.endDate}  (Day ${phase.startDay}-${phase.endDay})`, 15, y + 5);
      y += 10;

      for (const task of phase.tasks) {
        if (y > 278) { doc.addPage(); y = 15; }
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        doc.text(`${task.date}  —  ${task.task}`, 20, y);
        y += 5.5;
      }
      y += 4;
    }

    // Hindi summary
    if (y > 250) { doc.addPage(); y = 15; }
    y += 5;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Hindi Summary / हिंदी सारांश:', 15, y);
    y += 5;
    doc.setFontSize(8);
    const hindiLines = doc.splitTextToSize(cal.summaryHindi || '', w - 30);
    doc.text(hindiLines, 15, y);

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(`AgriConnect • Generated ${new Date().toLocaleDateString('en-IN')} • Page ${i}/${pageCount}`, 15, 290);
    }

    doc.save(`CropCalendar_${cal.crop}_${data.field.name}.pdf`);
  };

  // ── RENDER ──

  if (loading) {
    return (
      <div style={{ background: 'var(--bg-base)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <DashboardNav />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ width: 40, height: 40, border: '4px solid var(--primary-100)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          <h2 style={{ fontWeight: 600, fontSize: '1.25rem' }}>{generating ? `Generating ${crop} Calendar...` : 'Building Crop Calendar...'}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>AI is creating a personalized farming schedule for your field</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
        <DashboardNav />
        <main className="container" style={{ padding: '2rem' }}>
          <div className="alert alert-error">Error: {error}</div>
          <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={() => router.back()}>Go Back</button>
        </main>
      </div>
    );
  }

  const cal = data.calendar;

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', paddingBottom: '4rem' }}>
      <DashboardNav />

      <main className="container" style={{ padding: '2rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>

        {/* CACHED BANNER */}
        {data.cached && (
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '0.75rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ color: '#1e40af' }}>
              💾 Cached calendar from {new Date(data.cachedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
            <button
              onClick={() => { setGenerating(true); fetchCalendar(crop, true); }}
              style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '99px', padding: '5px 14px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              🔄 Regenerate
            </button>
          </div>
        )}

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-outfit), Outfit, sans-serif', fontWeight: 800, fontSize: '2rem', marginBottom: '0.25rem' }}>
              🗓️ {cal.crop} Calendar
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {cal.variety} • {cal.totalDurationDays} days • {cal.sowingWindow} → {cal.harvestWindow}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={downloadPDF} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              📥 Download PDF
            </button>
            <button className="btn btn-outline" onClick={() => router.push(`/farmer/yield/${fieldId}`)}>
              ← Back to Analysis
            </button>
          </div>
        </div>

        {/* CROP SELECTOR */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {['Wheat', 'Rice', 'Mustard', 'Chickpea', 'Soybean', 'Cotton', 'Maize', 'Potato', 'Onion', 'Tomato'].map(c => (
            <button
              key={c}
              onClick={() => handleCropChange(c)}
              style={{
                padding: '6px 16px', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', border: '1px solid',
                background: crop === c ? 'var(--primary)' : 'transparent',
                color: crop === c ? 'white' : 'var(--text-secondary)',
                borderColor: crop === c ? 'var(--primary)' : 'var(--border)',
                transition: 'all 0.2s',
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* SUMMARY CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { icon: '💧', label: 'Total Irrigations', value: cal.totalIrrigations },
            { icon: '🧪', label: 'Fertilizer Doses', value: cal.totalFertilizerApplications },
            { icon: '💰', label: 'Est. Cost/ha', value: cal.estimatedCostPerHa },
            { icon: '🌾', label: 'Expected Yield', value: cal.expectedYield },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{s.icon}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* TIMELINE */}
        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div style={{ position: 'absolute', left: '24px', top: 0, bottom: 0, width: '3px', background: 'var(--border)', borderRadius: '2px' }} />

          {cal.phases?.map((phase: any, pi: number) => (
            <div key={pi} style={{ position: 'relative', paddingLeft: '60px', marginBottom: '2rem' }}>
              {/* Phase dot */}
              <div style={{
                position: 'absolute', left: '12px', top: '4px',
                width: '28px', height: '28px', borderRadius: '50%',
                background: phase.color || '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 800, fontSize: '0.7rem', zIndex: 1,
                boxShadow: `0 0 0 4px var(--bg-base), 0 0 0 6px ${phase.color || '#22c55e'}40`,
              }}>
                {pi + 1}
              </div>

              {/* Phase card */}
              <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                {/* Phase header */}
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.15rem' }}>{phase.name}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {phase.startDate} → {phase.endDate} • Day {phase.startDay}–{phase.endDay}
                    </span>
                  </div>
                  <div style={{ background: `${phase.color}15`, color: phase.color, padding: '4px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {phase.endDay - phase.startDay} days
                  </div>
                </div>

                {/* Tasks */}
                <div style={{ padding: '0.75rem 1.5rem' }}>
                  {phase.tasks?.map((task: any, ti: number) => (
                    <div key={ti} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                      padding: '0.75rem 0',
                      borderBottom: ti < phase.tasks.length - 1 ? '1px solid var(--border)' : 'none',
                    }}>
                      <div style={{ fontSize: '1.25rem', flexShrink: 0, marginTop: '2px' }}>{task.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.15rem' }}>{task.task}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{task.date}</div>
                      </div>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '99px', flexShrink: 0,
                        background: `${TYPE_COLORS[task.type] || '#64748b'}15`,
                        color: TYPE_COLORS[task.type] || '#64748b',
                        textTransform: 'uppercase',
                      }}>
                        {task.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* HINDI SUMMARY */}
        {cal.summaryHindi && (
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', borderLeft: '4px solid var(--primary)', marginTop: '1rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>🗣️ हिंदी सारांश (Hindi Summary)</h3>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#334155' }}>{cal.summaryHindi}</p>
          </div>
        )}
      </main>
    </div>
  );
}
