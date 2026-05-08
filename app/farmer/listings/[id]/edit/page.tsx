'use client';

import { useRouter, notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useListingStore } from '@/store/listingStore';
import DashboardNav from '@/components/shared/DashboardNav';

const CROPS = ['Wheat', 'Rice', 'Onion', 'Tomato', 'Potato', 'Maize', 'Green Chili', 'Turmeric', 'Soybean', 'Cotton'];
const STORAGE = ['Field-fresh', 'Dry warehouse', 'Cold storage'];

export default function EditListingPage({ params }: { params: { id: string } }) {
  const { user, isAuthenticated } = useAuthStore();
  const { listings, updateListing, deleteListing } = useListingStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const listing = listings.find(l => l.id === params.id);

  const [form, setForm] = useState({
    cropName: '', variety: '', quantityKg: '', pricePerKg: '', minOrderKg: '',
    harvestDate: '', storageType: '', description: '',
  });

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'FARMER')) router.push('/auth/farmer');
  }, [mounted, isAuthenticated, user, router]);

  useEffect(() => {
    if (listing) {
      const cropBase = listing.cropName.split(' (')[0];
      setForm({
        cropName: cropBase, variety: listing.variety, quantityKg: String(listing.quantityKg),
        pricePerKg: String(listing.pricePerKg), minOrderKg: String(listing.minOrderKg),
        harvestDate: listing.harvestDate, storageType: listing.storageType, description: listing.description,
      });
    }
  }, [listing]);

  if (!mounted || !user) return null;
  if (!listing) notFound();

  // Ownership check: farmers can only edit their own listings
  if (listing.farmerId !== user.id) notFound();

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    updateListing(params.id, {
      cropName: form.cropName + (form.variety ? ` (${form.variety})` : ''),
      variety: form.variety,
      quantityKg: parseFloat(form.quantityKg),
      quantityRemaining: parseFloat(form.quantityKg),
      pricePerKg: parseFloat(form.pricePerKg),
      minOrderKg: parseFloat(form.minOrderKg) || 1,
      harvestDate: form.harvestDate,
      storageType: form.storageType,
      description: form.description,
    });
    router.push('/farmer/listings');
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      deleteListing(params.id);
      router.push('/farmer/listings');
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <DashboardNav />
      <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem' }}>Edit Listing</h1>

        <div className="card" style={{ padding: '2rem' }}>
          <div className="form-group">
            <label className="label">Crop Name</label>
            <select className="input" value={form.cropName} onChange={e => update('cropName', e.target.value)}>
              {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Variety</label>
            <input className="input" value={form.variety} onChange={e => update('variety', e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="label">Quantity (kg)</label>
              <input className="input" type="number" value={form.quantityKg} onChange={e => update('quantityKg', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Price (₹/kg)</label>
              <input className="input" type="number" value={form.pricePerKg} onChange={e => update('pricePerKg', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="label">Min Order (kg)</label>
            <input className="input" type="number" value={form.minOrderKg} onChange={e => update('minOrderKg', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">Harvest Date</label>
            <input className="input" type="date" value={form.harvestDate} onChange={e => update('harvestDate', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">Storage Type</label>
            <select className="input" value={form.storageType} onChange={e => update('storageType', e.target.value)}>
              {STORAGE.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={form.description} onChange={e => update('description', e.target.value)} style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <button className="btn btn-ghost" onClick={() => router.push('/farmer/listings')}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>💾 Save Changes</button>
          </div>
        </div>

        <button className="btn btn-ghost" style={{ marginTop: '2rem', color: '#DC2626', width: '100%', justifyContent: 'center' }}
          onClick={handleDelete}>
          🗑 Delete This Listing
        </button>
      </div>
    </main>
  );
}
