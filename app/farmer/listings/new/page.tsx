'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useListingStore } from '@/store/listingStore';
import DashboardNav from '@/components/shared/DashboardNav';
import VoiceListingPanel, { type ListingFormFields } from '@/components/farmer/VoiceListingPanel';

const CROPS = ['Wheat', 'Rice', 'Onion', 'Tomato', 'Potato', 'Maize', 'Green Chili', 'Turmeric', 'Soybean', 'Cotton', 'Mustard', 'Sugarcane'];
const CATEGORIES: Record<string, string> = { Wheat: 'Grains', Rice: 'Grains', Maize: 'Grains', Soybean: 'Pulses', Mustard: 'Oilseeds', Cotton: 'Fibers', Sugarcane: 'Cash Crops', Onion: 'Vegetables', Tomato: 'Vegetables', Potato: 'Vegetables', 'Green Chili': 'Spices', Turmeric: 'Spices' };
const STORAGE = ['Field-fresh', 'Dry warehouse', 'Cold storage'];
const DURATIONS = [{ label: '3 days', value: 3 }, { label: '7 days', value: 7 }, { label: '14 days', value: 14 }];

/* AI-sparkle icon */
const SparkleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/>
  </svg>
);

export default function NewListingPage() {
  const { user, isAuthenticated } = useAuthStore();
  const addListing = useListingStore(s => s.addListing);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [aiFields, setAiFields] = useState<Set<string>>(new Set()); // Track AI-filled fields
  const [form, setForm] = useState({
    cropName: '', variety: '', category: '', quantityKg: '', pricePerKg: '', minOrderKg: '1',
    harvestDate: '', storageType: 'Field-fresh', description: '', duration: 7, isB2b: true, isB2c: true,
    organic: false,
  });

  const searchParams = useSearchParams();

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'FARMER')) router.push('/auth/farmer');
  }, [mounted, isAuthenticated, user, router]);

  // Voice prefill: read URL params (?crop=X&qty=Y&price=Z&variety=V&organic=1&minOrder=M&storage=S&duration=D&desc=...)
  useEffect(() => {
    if (!mounted) return;
    const crop = searchParams.get('crop');
    const qty = searchParams.get('qty');
    const price = searchParams.get('price');
    const variety = searchParams.get('variety');
    const organic = searchParams.get('organic');
    const minOrder = searchParams.get('minOrder');
    const storage = searchParams.get('storage');
    const duration = searchParams.get('duration');
    const desc = searchParams.get('desc');

    if (crop || qty || price || variety || organic || minOrder || storage || duration || desc) {
      setForm(f => ({
        ...f,
        ...(crop ? { cropName: crop, category: CATEGORIES[crop] || '' } : {}),
        ...(variety ? { variety } : {}),
        ...(qty ? { quantityKg: qty } : {}),
        ...(price ? { pricePerKg: price } : {}),
        ...(organic === '1' ? { organic: true } : {}),
        ...(minOrder ? { minOrderKg: minOrder } : {}),
        ...(storage ? { storageType: storage } : {}),
        ...(duration ? { duration: parseInt(duration) } : {}),
        ...(desc ? { description: desc } : {}),
      }));
      // Auto-advance to step 2 if crop is set
      if (crop) setStep(qty && price ? 5 : 2);
    }
  }, [mounted, searchParams]);

  // Voice AI extraction callback
  const handleVoiceExtracted = useCallback((fields: ListingFormFields) => {
    const newAi = new Set<string>();
    setForm(f => {
      const updated = { ...f };
      if (fields.cropName) {
        updated.cropName = fields.cropName;
        updated.category = fields.category || CATEGORIES[fields.cropName] || f.category;
        newAi.add('cropName');
      }
      if (fields.variety) { updated.variety = fields.variety; newAi.add('variety'); }
      if (fields.quantityKg) { updated.quantityKg = fields.quantityKg; newAi.add('quantityKg'); }
      if (fields.pricePerKg) { updated.pricePerKg = fields.pricePerKg; newAi.add('pricePerKg'); }
      if (fields.harvestDate) { updated.harvestDate = fields.harvestDate; newAi.add('harvestDate'); }
      if (fields.isOrganic !== undefined) { updated.organic = fields.isOrganic; newAi.add('organic'); }
      if (fields.minOrderKg) { updated.minOrderKg = fields.minOrderKg; newAi.add('minOrderKg'); }
      if (fields.storageType) { updated.storageType = fields.storageType; newAi.add('storageType'); }
      if (fields.duration) { updated.duration = fields.duration; newAi.add('duration'); }
      if (fields.description) { updated.description = fields.description; newAi.add('description'); }
      return updated;
    });
    setAiFields(newAi);
    // Clear AI highlights after 3s
    setTimeout(() => setAiFields(new Set()), 3000);
    // Auto-advance to review if all key fields present
    if (fields.cropName && fields.quantityKg && fields.pricePerKg) {
      setStep(5);
    } else if (fields.cropName) {
      setStep(2);
    }
  }, []);

  if (!mounted || !user) return null;

  const update = (k: string, v: string | number | boolean) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    const expires = new Date();
    expires.setDate(expires.getDate() + form.duration);
    addListing({
      farmerId: user.id, farmerName: user.name, farmName: user.farmName || 'My Farm',
      cropName: form.cropName + (form.variety ? ` (${form.variety})` : ''),
      variety: form.variety, category: form.category || CATEGORIES[form.cropName] || 'Other',
      quantityKg: parseFloat(form.quantityKg), quantityRemaining: parseFloat(form.quantityKg),
      pricePerKg: parseFloat(form.pricePerKg), minOrderKg: parseFloat(form.minOrderKg) || 1,
      harvestDate: form.harvestDate, storageType: form.storageType, description: form.description,
      images: [], status: 'ACTIVE', isB2b: form.isB2b, isB2c: form.isB2c, organic: form.organic,
      expiresAt: expires.toISOString(), location: 'Indore, MP', state: 'Madhya Pradesh',
    });
    router.push('/farmer/listings');
  };

  const canNext = () => {
    if (step === 1) return !!form.cropName;
    if (step === 2) {
      const q = parseFloat(form.quantityKg);
      const p = parseFloat(form.pricePerKg);
      const min = parseFloat(form.minOrderKg) || 1;
      return !!form.quantityKg && !!form.pricePerKg && q > 0 && p > 0 && min <= q;
    }
    return true;
  };

  /* Helper to add AI-flash class */
  const aiClass = (field: string) => aiFields.has(field) ? 'ai-filled' : '';

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingBottom: '5rem' }}>
      <DashboardNav />
      <div className="container" style={{ padding: '1.75rem 1.5rem' }}>

        {/* ── Two-column layout (Stitch: voice left, form right) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 380px) 1fr',
          gap: '2rem',
          alignItems: 'start',
        }} className="voice-form-grid">

          {/* LEFT — Voice Panel (sticky) */}
          <div style={{ position: 'sticky', top: 'calc(var(--nav-height) + 1.5rem)' }}>
            <VoiceListingPanel onExtracted={handleVoiceExtracted} pincode="461001" />
          </div>

          {/* RIGHT — Form */}
          <div>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontStyle: 'italic', marginBottom: '0.25rem' }}>
                Review & Confirm Listing
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                We&apos;ve extracted the details from your voice description.
              </p>
            </div>

            {/* ── Produce Information Card ───────────────────────── */}
            <div className="card" style={{ padding: '1.5rem 1.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green-900)" strokeWidth="2"><path d="M12 22c6.23-.05 7.87-5.57 7.5-10-.36-4.34-3.95-9.96-7.5-10-3.55.04-7.14 5.66-7.5 10-.37 4.43 1.27 9.95 7.5 10z"/><path d="M12 22V8"/><path d="M8 14c2.5-2.5 6-2 8 0"/></svg>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Produce Information</h2>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="label">Produce Type</label>
                  <div style={{ position: 'relative' }}>
                    <select className={`input ${aiClass('cropName')}`} value={form.cropName} onChange={e => { update('cropName', e.target.value); update('category', CATEGORIES[e.target.value] || ''); }} data-testid="form-crop" style={{ paddingRight: '2rem' }}>
                      <option value="">Select crop…</option>
                      {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {aiFields.has('cropName') && <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--green-700)' }}><SparkleIcon /></span>}
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">Variety (Optional)</label>
                  <input className={`input ${aiClass('variety')}`} placeholder="e.g., Roma, Cherry" value={form.variety} onChange={e => update('variety', e.target.value)} />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label className="label">Farming Method {aiFields.has('organic') && <span style={{ color: 'var(--green-700)', marginLeft: '0.3rem' }}><SparkleIcon /></span>}</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className={`btn btn-sm ${form.organic ? 'btn-primary' : 'btn-outline'} ${aiFields.has('organic') ? 'ai-filled' : ''}`}
                    onClick={() => update('organic', true)} style={{ borderRadius: 'var(--radius-md)' }}>
                    {form.organic && '◉ '}Organic
                  </button>
                  <button type="button" className={`btn btn-sm ${!form.organic ? 'btn-primary' : 'btn-outline'} ${aiFields.has('organic') ? 'ai-filled' : ''}`}
                    onClick={() => update('organic', false)} style={{ borderRadius: 'var(--radius-md)' }}>
                    {!form.organic && '◉ '}Conventional
                  </button>
                </div>
              </div>
            </div>

            {/* ── Quantity & Pricing Card ────────────────────────── */}
            <div className="card" style={{ padding: '1.5rem 1.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green-900)" strokeWidth="2"><path d="M16 16v3a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h2"/><rect x="8" y="2" width="12" height="12" rx="2"/></svg>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Quantity & Pricing</h2>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="label">Total Quantity</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input className={`input ${aiClass('quantityKg')}`} type="number" placeholder="50" value={form.quantityKg} onChange={e => update('quantityKg', e.target.value)} min="1" required />
                      {aiFields.has('quantityKg') && <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--green-700)' }}><SparkleIcon /></span>}
                    </div>
                    <div style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>kg</div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">Price per unit</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>₹</span>
                    <input className={`input ${aiClass('pricePerKg')}`} type="number" placeholder="40" value={form.pricePerKg} onChange={e => update('pricePerKg', e.target.value)} min="1" required style={{ paddingLeft: '1.75rem' }} />
                    {aiFields.has('pricePerKg') && <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--green-700)' }}><SparkleIcon /></span>}
                  </div>
                  {form.pricePerKg && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--green-700)', marginTop: '0.3rem' }}>
                      Suggested Mandi Price: ₹{Math.max(1, Math.round(parseFloat(form.pricePerKg) * 0.9))} - ₹{Math.round(parseFloat(form.pricePerKg) * 1.15)}/kg
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label className="label">Minimum Order (kg) {aiFields.has('minOrderKg') && <span style={{ color: 'var(--green-700)', marginLeft: '0.3rem' }}><SparkleIcon /></span>}</label>
                <input className={`input ${aiClass('minOrderKg')}`} type="number" placeholder="1" value={form.minOrderKg} onChange={e => update('minOrderKg', e.target.value)} min="1" />
                {parseFloat(form.minOrderKg) > parseFloat(form.quantityKg) && form.quantityKg && (
                  <div style={{ color: '#C1121F', fontSize: '0.8rem', marginTop: '0.25rem' }}>⚠ Minimum order cannot exceed total quantity.</div>
                )}
              </div>
              {form.quantityKg && form.pricePerKg && (
                <div style={{ background: 'var(--green-50)', border: '1px solid var(--green-100)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--green-900)', fontWeight: 600 }}>
                  💰 Total value: ₹{(parseFloat(form.quantityKg) * parseFloat(form.pricePerKg)).toLocaleString()}
                </div>
              )}
            </div>

            {/* ── Details Card ───────────────────────────────────── */}
            <div className="card" style={{ padding: '1.5rem 1.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green-900)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Additional Details</h2>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="label">Harvest Date {aiFields.has('harvestDate') && <span style={{ color: 'var(--green-700)', marginLeft: '0.3rem' }}><SparkleIcon /></span>}</label>
                  <input className={`input ${aiClass('harvestDate')}`} type="date" value={form.harvestDate} onChange={e => update('harvestDate', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="label">Storage Type {aiFields.has('storageType') && <span style={{ color: 'var(--green-700)', marginLeft: '0.3rem' }}><SparkleIcon /></span>}</label>
                  <select className={`input ${aiClass('storageType')}`} value={form.storageType} onChange={e => update('storageType', e.target.value)}>
                    {STORAGE.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="label">Duration {aiFields.has('duration') && <span style={{ color: 'var(--green-700)', marginLeft: '0.3rem' }}><SparkleIcon /></span>}</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {DURATIONS.map(d => (
                    <button key={d.value} type="button" className={`btn btn-sm ${form.duration === d.value ? 'btn-primary' : 'btn-outline'} ${aiFields.has('duration') && form.duration === d.value ? 'ai-filled' : ''}`} style={{ borderRadius: 'var(--radius-md)' }}
                      onClick={() => update('duration', d.value)}>{d.label}</button>
                  ))}
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label className="label">Description (optional) {aiFields.has('description') && <span style={{ color: 'var(--green-700)', marginLeft: '0.3rem' }}><SparkleIcon /></span>}</label>
                <textarea className={`input ${aiClass('description')}`} rows={3} placeholder="Grade A, machine-cleaned..."
                  value={form.description} onChange={e => update('description', e.target.value)} style={{ resize: 'vertical' }} />
              </div>
            </div>

            {/* ── Photos Card ────────────────────────────────────── */}
            <div className="card" style={{ padding: '1.5rem 1.75rem', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green-900)" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Photos</h2>
                </div>
                <span className="badge badge-gray">OPTIONAL</span>
              </div>
              <div style={{
                border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)',
                padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)',
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/></svg>
                <span style={{ fontSize: '0.85rem' }}>Add Photo</span>
              </div>
            </div>

            {/* ── Action Buttons ─────────────────────────────────── */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-outline btn-lg" style={{ flex: 1 }}
                onClick={() => router.push('/farmer/listings')}>
                Save Draft
              </button>
              <button className="btn btn-primary btn-lg" id="post-listing-btn" style={{ flex: 1.5 }}
                disabled={!form.cropName || !form.quantityKg || !form.pricePerKg}
                onClick={handleSubmit}>
                Publish Listing →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive: stack on mobile */}
      <style>{`
        @media (max-width: 768px) {
          .voice-form-grid {
            grid-template-columns: 1fr !important;
          }
          .voice-form-grid > div:first-child {
            position: static !important;
          }
        }
      `}</style>
    </main>
  );
}
