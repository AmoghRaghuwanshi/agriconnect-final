'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useListingStore } from '@/store/listingStore';
import { useOrderStore } from '@/store/orderStore';
import { useAuthStore } from '@/store/authStore';

export default function WholesalerBrowse() {
  const [mounted, setMounted] = useState(false);
  const { listings } = useListingStore();
  const { addOrder } = useOrderStore();
  const { user } = useAuthStore();
  const [cropFilter, setCropFilter] = useState('All Crops');
  const [stateFilter, setStateFilter] = useState('All States');
  const [sortBy, setSortBy] = useState('Score');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [favs, setFavs] = useState<string[]>([]);
  const [orderModal, setOrderModal] = useState<null | typeof b2bListings[0]>(null);
  const [orderQty, setOrderQty] = useState(100);
  const [orderSuccess, setOrderSuccess] = useState('');

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  // Demo B2B listings (enriched with farmer data)
  const b2bListings = [
    { id: 'L-B2B-01', cropName: 'Wheat (Lokwan)', variety: 'HD-3086', pricePerKg: 22, quantityRemaining: 2000, minOrderKg: 100, maxOrderKg: 1000, storageType: 'Warehouse', farmName: 'Raju Farms', farmerVillage: 'Hoshangabad', farmerState: 'MP', farmerScore: 84, farmerOrders: 12, farmerVerified: true, farmerId: 'demo-farmer-001' },
    { id: 'L-B2B-02', cropName: 'Onion (Nashik Red)', variety: 'N-53', pricePerKg: 14, quantityRemaining: 1500, minOrderKg: 200, maxOrderKg: 800, storageType: 'Cold Storage', farmName: 'Kumar Organic Farm', farmerVillage: 'Nashik', farmerState: 'MH', farmerScore: 71, farmerOrders: 8, farmerVerified: true, farmerId: 'demo-farmer-002' },
    { id: 'L-B2B-03', cropName: 'Potato (Agra)', variety: 'Kufri Jyoti', pricePerKg: 12, quantityRemaining: 3000, minOrderKg: 500, maxOrderKg: 2000, storageType: 'Cold Storage', farmName: 'H.K. Farms', farmerVillage: 'Lucknow', farmerState: 'UP', farmerScore: 91, farmerOrders: 18, farmerVerified: true, farmerId: 'demo-farmer-004' },
    { id: 'L-B2B-04', cropName: 'Basmati Rice', variety: 'Pusa 1121', pricePerKg: 52, quantityRemaining: 800, minOrderKg: 100, maxOrderKg: 500, storageType: 'Warehouse', farmName: 'Venkat Agri', farmerVillage: 'Kolar', farmerState: 'KA', farmerScore: 65, farmerOrders: 5, farmerVerified: true, farmerId: 'demo-farmer-005' },
    { id: 'L-B2B-05', cropName: 'Green Chili', variety: 'Guntur Sannam', pricePerKg: 45, quantityRemaining: 400, minOrderKg: 50, maxOrderKg: 200, storageType: 'Open Air', farmName: 'Sunita Farm', farmerVillage: 'Varanasi', farmerState: 'UP', farmerScore: 0, farmerOrders: 0, farmerVerified: false, farmerId: 'demo-farmer-003' },
    // Include active listings from store
    ...listings.filter(l => l.status === 'ACTIVE').map(l => ({
      id: l.id, cropName: l.cropName, variety: l.variety || '', pricePerKg: l.pricePerKg,
      quantityRemaining: l.quantityRemaining, minOrderKg: l.minOrderKg || 50, maxOrderKg: 500,
      storageType: l.storageType || 'Warehouse', farmName: l.farmerName || 'Farm',
      farmerVillage: '', farmerState: '', farmerScore: 0, farmerOrders: 0,
      farmerVerified: false, farmerId: ''
    }))
  ];

  // Dedupe by id
  const uniqueListings = b2bListings.filter((l, i, a) => a.findIndex(x => x.id === l.id) === i);

  const crops = Array.from(new Set(uniqueListings.map(l => l.cropName)));
  const states = Array.from(new Set(uniqueListings.map(l => l.farmerState).filter(Boolean)));

  let filtered = uniqueListings.filter(l => {
    if (cropFilter !== 'All Crops' && l.cropName !== cropFilter) return false;
    if (stateFilter !== 'All States' && l.farmerState !== stateFilter) return false;
    if (verifiedOnly && !l.farmerVerified) return false;
    return true;
  });

  if (sortBy === 'Score') filtered.sort((a, b) => b.farmerScore - a.farmerScore);
  else if (sortBy === 'Price Asc') filtered.sort((a, b) => a.pricePerKg - b.pricePerKg);
  else if (sortBy === 'Price Desc') filtered.sort((a, b) => b.pricePerKg - a.pricePerKg);
  else if (sortBy === 'Latest') filtered.sort((a, b) => b.quantityRemaining - a.quantityRemaining);

  const toggleFav = (id: string) => setFavs(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderModal || !user) return;
    addOrder({
      buyerId: user.id,
      buyerName: user.businessName ?? user.name,
      farmerId: orderModal.farmerId || 'demo-farmer-001',
      farmerName: orderModal.farmName,
      farmName: orderModal.farmName,
      listingId: orderModal.id,
      cropName: orderModal.cropName,
      quantityKg: orderQty,
      pricePerKg: orderModal.pricePerKg,
      totalAmount: orderQty * orderModal.pricePerKg,
      orderStatus: 'PENDING',
      paymentStatus: 'PENDING',
      orderType: 'B2B',
      deliveryAddress: { label: 'Warehouse', line1: 'Plot 45 Industrial Area', city: 'Indore', state: 'MP', pincode: '452001' },
    });
    setOrderSuccess(orderModal.cropName);
    setOrderModal(null);
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">🔍 Browse B2B Listings</h1>
        <p className="page-subtitle">Find suppliers for your business — minimum 50kg stock</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <select className="input" style={{ width: '160px' }} value={cropFilter} onChange={e => setCropFilter(e.target.value)}>
          <option>All Crops</option>
          {crops.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="input" style={{ width: '140px' }} value={stateFilter} onChange={e => setStateFilter(e.target.value)}>
          <option>All States</option>
          {states.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="input" style={{ width: '140px' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option>Score</option>
          <option>Latest</option>
          <option>Price Asc</option>
          <option>Price Desc</option>
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.88rem', color: '#475569' }}>
          <input type="checkbox" checked={verifiedOnly} onChange={() => setVerifiedOnly(!verifiedOnly)} />
          Verified only
        </label>
      </div>

      {/* Listings Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {filtered.map(l => (
          <div key={l.id} className="card" style={{ padding: '1.25rem', position: 'relative' }}>
            {/* Favourite */}
            <button onClick={() => toggleFav(l.id)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>
              {favs.includes(l.id) ? '⭐' : '☆'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', paddingRight: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{l.cropName}</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{l.variety}</p>
              </div>
              {l.farmerVerified && <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>✅ Verified</span>}
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#14b8a6' }}>₹{l.pricePerKg}/kg</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{l.quantityRemaining.toLocaleString()}kg available</div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.75rem' }}>
              <span className="badge badge-blue">Min: {l.minOrderKg}kg</span>
              <span className="badge badge-blue">Max: {l.maxOrderKg}kg</span>
              <span className="badge badge-gray">{l.storageType}</span>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 500 }}>{l.farmName}</div>
              <div style={{ color: '#94a3b8' }}>📍 {l.farmerVillage}{l.farmerVillage && l.farmerState ? ', ' : ''}{l.farmerState}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <span>⭐ {l.farmerScore}/100</span>
                <span style={{ color: '#94a3b8' }}>•</span>
                <span>{l.farmerOrders} delivered</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-primary btn-sm"
                style={{ flex: 1, textAlign: 'center' }}
                onClick={() => { setOrderQty(l.minOrderKg); setOrderModal(l); }}
              >
                Place Order
              </button>
              <Link
                href={`/wholesaler/rfq/new?farmer=${l.farmerId}&listing=${l.id}&crop=${encodeURIComponent(l.cropName)}&price=${l.pricePerKg}`}
                className="btn btn-outline btn-sm"
                style={{ textAlign: 'center' }}
              >
                RFQ
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={() => toggleFav(l.id)} style={{ fontSize: '0.8rem' }}>
                {favs.includes(l.id) ? '⭐' : '☆'}
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">No listings found</div>
            <div className="empty-state-text">Try adjusting your filters</div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748b' }}>
        {filtered.length} listing{filtered.length !== 1 ? 's' : ''} shown
      </div>

      {/* Order Modal */}
      {orderModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ padding: '2rem', maxWidth: '420px', width: '90%' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Place B2B Order</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              {orderModal.cropName} from {orderModal.farmName}
            </p>
            <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Quantity (kg)</label>
                <input
                  type="number"
                  className="input"
                  value={orderQty}
                  onChange={e => setOrderQty(Number(e.target.value))}
                  min={orderModal.minOrderKg}
                  max={orderModal.maxOrderKg}
                  step={10}
                  required
                />
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Min: {orderModal.minOrderKg}kg · Max: {orderModal.maxOrderKg}kg</div>
              </div>
              <div style={{ padding: '0.75rem 1rem', background: '#f0fdfa', borderRadius: '6px', fontSize: '0.9rem', color: '#0f766e', fontWeight: 600 }}>
                Total: ₹{(orderQty * orderModal.pricePerKg).toLocaleString()} @ ₹{orderModal.pricePerKg}/kg
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Confirm Order</button>
                <button type="button" className="btn btn-ghost" onClick={() => setOrderModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Success Toast */}
      {orderSuccess && (
        <div style={{
          position: 'fixed', bottom: '2rem', right: '2rem',
          background: '#14b8a6', color: '#fff',
          padding: '1rem 1.5rem', borderRadius: '10px',
          fontWeight: 600, fontSize: '0.9rem', zIndex: 2000,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>
          ✅ Order placed for {orderSuccess}!
          <button onClick={() => setOrderSuccess('')} style={{ background: 'none', border: 'none', color: '#fff', marginLeft: '0.75rem', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
        </div>
      )}
    </div>
  );
}
