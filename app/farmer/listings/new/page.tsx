'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useListingStore } from '@/store/listingStore';
import DashboardNav from '@/components/shared/DashboardNav';

const CROPS = ['Wheat', 'Rice', 'Onion', 'Tomato', 'Potato', 'Maize', 'Green Chili', 'Turmeric', 'Soybean', 'Cotton', 'Mustard', 'Sugarcane'];
const CATEGORIES: Record<string, string> = { Wheat: 'Grains', Rice: 'Grains', Maize: 'Grains', Soybean: 'Pulses', Mustard: 'Oilseeds', Cotton: 'Fibers', Sugarcane: 'Cash Crops', Onion: 'Vegetables', Tomato: 'Vegetables', Potato: 'Vegetables', 'Green Chili': 'Spices', Turmeric: 'Spices' };
const STORAGE = ['Field-fresh', 'Dry warehouse', 'Cold storage'];
const DURATIONS = [{ label: '3 days', value: 3 }, { label: '7 days', value: 7 }, { label: '14 days', value: 14 }];

export default function NewListingPage() {
  const { user, isAuthenticated } = useAuthStore();
  const addListing = useListingStore(s => s.addListing);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    cropName: '', variety: '', category: '', quantityKg: '', pricePerKg: '', minOrderKg: '1',
    harvestDate: '', storageType: 'Field-fresh', description: '', duration: 7, isB2b: true, isB2c: true,
  });

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'FARMER')) router.push('/auth/farmer');
  }, [mounted, isAuthenticated, user, router]);

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
      images: [], status: 'ACTIVE', isB2b: form.isB2b, isB2c: form.isB2c,
      expiresAt: expires.toISOString(), location: 'Indore, MP', state: 'Madhya Pradesh',
    });
    router.push('/farmer/listings');
  };

  const canNext = () => {
    if (step === 1) return !!form.cropName;
    if (step === 2) return !!form.quantityKg && !!form.pricePerKg && parseFloat(form.quantityKg) > 0 && parseFloat(form.pricePerKg) > 0;
    return true;
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <DashboardNav />
      <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '640px', margin: '0 auto' }}>
        {/* Progress */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', justifyContent: 'center' }}>
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: step >= s ? 'var(--green-900)' : 'var(--border)', color: step >= s ? '#fff' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>{s}</div>
              {s < 5 && <div style={{ width: '2rem', height: '2px', background: step > s ? 'var(--green-900)' : 'var(--border)' }} />}
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <span className="badge badge-green" style={{ marginBottom: '0.5rem' }}>Step {step} of 5</span>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
              {step === 1 ? 'Crop Selection' : step === 2 ? 'Quantity & Price' : step === 3 ? 'Quality Details' : step === 4 ? 'Availability' : 'Review & Post'}
            </h1>
          </div>

          {step === 1 && (
            <>
              <div className="form-group">
                <label className="label">Crop Name *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {CROPS.map(c => (
                    <button key={c} type="button" className={`btn btn-sm ${form.cropName === c ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => { update('cropName', c); update('category', CATEGORIES[c] || ''); }}>{c}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="label">Variety (optional)</label>
                <input className="input" placeholder="e.g., Lokwan, HD-2781" value={form.variety} onChange={e => update('variety', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Category</label>
                <input className="input" value={form.category || CATEGORIES[form.cropName] || ''} readOnly style={{ background: 'var(--bg-base)' }} />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="label">Quantity (kg) *</label>
                  <input className="input" type="number" placeholder="500" value={form.quantityKg} onChange={e => update('quantityKg', e.target.value)} min="1" required />
                </div>
                <div className="form-group">
                  <label className="label">Price per kg (₹) *</label>
                  <input className="input" type="number" placeholder="28" value={form.pricePerKg} onChange={e => update('pricePerKg', e.target.value)} min="1" required />
                </div>
              </div>
              <div className="form-group">
                <label className="label">Minimum order (kg)</label>
                <input className="input" type="number" placeholder="1" value={form.minOrderKg} onChange={e => update('minOrderKg', e.target.value)} min="1" />
              </div>
              {form.quantityKg && form.pricePerKg && (
                <div className="alert alert-info" style={{ marginTop: '0.5rem' }}>
                  <span>💰</span><span>Total value: ₹{(parseFloat(form.quantityKg) * parseFloat(form.pricePerKg)).toLocaleString()}</span>
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <div className="form-group">
                <label className="label">Harvest Date</label>
                <input className="input" type="date" value={form.harvestDate} onChange={e => update('harvestDate', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Storage Type</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {STORAGE.map(s => (
                    <button key={s} type="button" className={`btn btn-sm ${form.storageType === s ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => update('storageType', s)}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="label">Description (optional)</label>
                <textarea className="input" rows={3} placeholder="Grade A, machine-cleaned..."
                  value={form.description} onChange={e => update('description', e.target.value)} style={{ resize: 'vertical' }} />
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="form-group">
                <label className="label">Listing Duration</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {DURATIONS.map(d => (
                    <button key={d.value} type="button" className={`btn btn-sm ${form.duration === d.value ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => update('duration', d.value)}>{d.label}</button>
                  ))}
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="label">Available for</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.isB2c} onChange={e => update('isB2c', e.target.checked)} />
                    <span>🛒 B2C — Consumers</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.isB2b} onChange={e => update('isB2b', e.target.checked)} />
                    <span>🏭 B2B — Wholesalers</span>
                  </label>
                </div>
              </div>
            </>
          )}

          {step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="card-flat" style={{ padding: '1.25rem' }}>
                <div className="label-cap">Crop</div>
                <div style={{ fontWeight: 600 }}>{form.cropName} {form.variety && `(${form.variety})`}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{form.category || CATEGORIES[form.cropName]}</div>
              </div>
              <div className="form-row">
                <div className="card-flat" style={{ padding: '1.25rem' }}>
                  <div className="label-cap">Quantity</div>
                  <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{form.quantityKg} kg</div>
                </div>
                <div className="card-flat" style={{ padding: '1.25rem' }}>
                  <div className="label-cap">Price</div>
                  <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--green-900)' }}>₹{form.pricePerKg}/kg</div>
                </div>
              </div>
              <div className="card-flat" style={{ padding: '1.25rem' }}>
                <div className="label-cap">Details</div>
                <div style={{ fontSize: '0.85rem' }}>{form.storageType} · {form.duration}-day listing · Min {form.minOrderKg} kg</div>
                {form.description && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{form.description}</div>}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            {step > 1 ? (
              <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)}>← Back</button>
            ) : (
              <button className="btn btn-ghost" onClick={() => router.push('/farmer/listings')}>Cancel</button>
            )}
            {step < 5 ? (
              <button className="btn btn-primary" disabled={!canNext()} onClick={() => setStep(s => s + 1)}>Continue →</button>
            ) : (
              <button className="btn btn-primary" id="post-listing-btn" onClick={handleSubmit}>🌾 Post Listing</button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
