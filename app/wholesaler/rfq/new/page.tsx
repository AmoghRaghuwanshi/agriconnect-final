'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useRFQStore } from '@/store/rfqStore';
import { useAuthStore } from '@/store/authStore';

const DEMO_FARMERS = [
  { id: 'demo-farmer-001', name: 'Raju Patel', farmName: 'Raju Farms', location: 'Hoshangabad, MP', crops: ['Wheat (Lokwan)', 'Onion', 'Potato'], score: 84, isVerified: true },
  { id: 'demo-farmer-002', name: 'Suresh Kumar', farmName: 'Kumar Organic Farm', location: 'Nashik, MH', crops: ['Onion', 'Tomato', 'Garlic'], score: 71, isVerified: true },
  { id: 'demo-farmer-003', name: 'Sunita Devi', farmName: 'Sunita Farm', location: 'Varanasi, UP', crops: ['Green Chili', 'Tomato'], score: 0, isVerified: false },
  { id: 'demo-farmer-004', name: 'Harish Kumar', farmName: 'H.K. Farms', location: 'Lucknow, UP', crops: ['Potato', 'Wheat (Lokwan)', 'Rice'], score: 91, isVerified: true },
  { id: 'demo-farmer-005', name: 'Venkat Rao', farmName: 'Venkat Agri', location: 'Kolar, KA', crops: ['Basmati Rice', 'Green Chili', 'Turmeric'], score: 65, isVerified: true },
];

const CREDIT_AVAILABLE = 44500;

export default function NewRFQPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { addRfq } = useRFQStore();
  const [mounted, setMounted] = useState(false);

  // Pre-fill from URL params (e.g., coming from Browse or Favourites)
  const prefillFarmerId = searchParams.get('farmer') ?? '';
  const prefillCrop     = searchParams.get('crop') ?? '';
  const prefillPrice    = searchParams.get('price') ?? '';
  const prefillListingId = searchParams.get('listing') ?? '';

  const [farmerId, setFarmerId] = useState(prefillFarmerId || 'demo-farmer-001');
  const [search, setSearch] = useState('');
  const [cropName, setCropName] = useState(prefillCrop);
  const [quantityKg, setQuantityKg] = useState(200);
  const [pricePerKg, setPricePerKg] = useState(prefillPrice ? parseFloat(prefillPrice) : 0);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => { setMounted(true); }, []);
  if (!mounted || !user) return null;

  const farmer = DEMO_FARMERS.find(f => f.id === farmerId) ?? DEMO_FARMERS[0];
  const filteredFarmers = DEMO_FARMERS.filter(f =>
    !search || f.farmName.toLowerCase().includes(search.toLowerCase()) || f.name.toLowerCase().includes(search.toLowerCase())
  );

  // Auto-set first crop when farmer changes
  const handleFarmerChange = (id: string) => {
    setFarmerId(id);
    const f = DEMO_FARMERS.find(x => x.id === id);
    if (f && !prefillCrop) setCropName(f.crops[0] ?? '');
  };

  const orderCost = quantityKg * pricePerKg;
  const creditOk = CREDIT_AVAILABLE >= orderCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropName || !pricePerKg || !quantityKg) return;
    setSubmitting(true);

    const rfqId = addRfq({
      listingId: prefillListingId || `L-${farmer.id}`,
      farmerId: farmer.id,
      farmerName: farmer.farmName,
      wholesalerId: user.id,
      wholesalerName: user.businessName ?? user.name,
      cropName,
      initialQuantityKg: quantityKg,
      initialPricePerKg: pricePerKg,
      currentQuantityKg: quantityKg,
      currentPricePerKg: pricePerKg,
    });

    setTimeout(() => {
      setSubmitting(false);
      setSuccess(rfqId);
    }, 600);
  };

  if (success) {
    return (
      <div style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>RFQ Sent!</h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
          Your request has been sent to <strong>{farmer.farmName}</strong>.<br />
          You&apos;ll be notified when they respond.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <Link href={`/wholesaler/rfq/${success}`} className="btn btn-primary">Open Chat →</Link>
          <Link href="/wholesaler/rfq" className="btn btn-outline">Back to RFQs</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '700px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/wholesaler/rfq" className="btn btn-ghost" style={{ paddingLeft: 0 }}>← Back to RFQs</Link>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.5rem' }}>💬 New RFQ Request</h1>
        <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Negotiate directly with a farmer before placing a bulk order</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Farmer Picker */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>1. Select Farmer</h3>

          <input
            type="text"
            className="input"
            placeholder="Search by farm name or farmer name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ marginBottom: '0.75rem' }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '220px', overflowY: 'auto' }}>
            {filteredFarmers.map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => handleFarmerChange(f.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '0.75rem 1rem',
                  border: `2px solid ${farmerId === f.id ? '#14b8a6' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  background: farmerId === f.id ? '#f0fdfa' : 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0f2f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>
                  👨🏽‍🌾
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {f.farmName}
                    {f.isVerified && <span className="badge badge-green" style={{ fontSize: '0.6rem' }}>✅</span>}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{f.location} · ⭐ {f.score}/100</div>
                </div>
                {farmerId === f.id && <span style={{ color: '#14b8a6', fontSize: '1.2rem' }}>✓</span>}
              </button>
            ))}
          </div>

          {farmer && (
            <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
              <strong>Available crops:</strong> {farmer.crops.join(', ')}
            </div>
          )}
        </div>

        {/* Crop + Quantity + Price */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem' }}>2. Order Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0, gridColumn: '1/-1' }}>
              <label className="form-label">Crop</label>
              <select
                className="input"
                value={cropName}
                onChange={e => setCropName(e.target.value)}
                required
              >
                <option value="">— Select a crop —</option>
                {farmer.crops.map(c => <option key={c}>{c}</option>)}
                <option>Other (specify in notes)</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Quantity (kg)</label>
              <input
                type="number"
                className="input"
                value={quantityKg}
                onChange={e => setQuantityKg(Number(e.target.value))}
                min={50}
                max={50000}
                step={10}
                required
              />
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Minimum 50 kg</div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Proposed Price (₹/kg)</label>
              <input
                type="number"
                className="input"
                value={pricePerKg || ''}
                onChange={e => setPricePerKg(Number(e.target.value))}
                min={1}
                step={0.5}
                placeholder="e.g. 22"
                required
              />
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Your initial offer</div>
            </div>
          </div>

          <div className="form-group" style={{ margin: '1rem 0 0' }}>
            <label className="form-label">Notes <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span></label>
            <textarea
              className="input"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Need weekly delivery if deal works, prefer HD-3086 variety…"
              maxLength={500}
            />
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem', textAlign: 'right' }}>
              {notes.length}/500
            </div>
          </div>
        </div>

        {/* Credit Check */}
        {pricePerKg > 0 && quantityKg > 0 && (
          <div style={{
            padding: '1rem 1.25rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            background: creditOk ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${creditOk ? '#bbf7d0' : '#fecaca'}`,
            color: creditOk ? '#166534' : '#991b1b',
          }}>
            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
              {creditOk ? '✅ Credit sufficient' : '⚠️ Insufficient credit'}
            </div>
            This RFQ order would cost{' '}
            <strong>₹{orderCost.toLocaleString()}</strong>.{' '}
            Available credit: <strong>₹{CREDIT_AVAILABLE.toLocaleString()}</strong>.
            {!creditOk && ' Reduce quantity or price.'}
          </div>
        )}

        {/* Submit */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || !cropName || !pricePerKg || !creditOk}
            style={{ minWidth: '140px' }}
          >
            {submitting ? '⏳ Sending…' : '💬 Send RFQ'}
          </button>
          <Link href="/wholesaler/rfq" className="btn btn-ghost">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
