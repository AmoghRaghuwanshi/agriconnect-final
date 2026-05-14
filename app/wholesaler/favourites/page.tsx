'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function WholesalerFavourites() {
  const [mounted, setMounted] = useState(false);
  const [favourites, setFavourites] = useState([
    { id: 'demo-farmer-001', name: 'Raju Patel', farmName: 'Raju Farms', location: 'Hoshangabad, MP', topCrops: ['Wheat', 'Onion', 'Potato'], score: 84, ordersWithYou: 12, isVerified: true },
    { id: 'demo-farmer-004', name: 'Harish Kumar', farmName: 'H.K. Farms', location: 'Lucknow, UP', topCrops: ['Potato', 'Wheat'], score: 91, ordersWithYou: 8, isVerified: true },
    { id: 'demo-farmer-002', name: 'Suresh Kumar', farmName: 'Kumar Organic Farm', location: 'Nashik, MH', topCrops: ['Onion', 'Tomato'], score: 71, ordersWithYou: 5, isVerified: true },
    { id: 'demo-farmer-005', name: 'Venkat Rao', farmName: 'Venkat Agri', location: 'Kolar, KA', topCrops: ['Rice', 'Green Chili'], score: 65, ordersWithYou: 3, isVerified: true },
  ]);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const removeFavourite = (id: string) => { setFavourites(favourites.filter(f => f.id !== id)); };

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">⭐ Favourite Suppliers</h1>
        <p className="page-subtitle">Quickly access and order from your trusted farmers</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {favourites.map(farmer => (
          <div key={farmer.id} className="card" style={{ padding: '1.5rem', position: 'relative' }}>
            <button onClick={() => removeFavourite(farmer.id)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#ef4444' }} title="Remove from favourites">
              ❤️
            </button>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e0f2f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                👨🏽‍🌾
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {farmer.farmName}
                  {farmer.isVerified && <span className="badge badge-green" style={{ fontSize: '0.6rem' }}>✅</span>}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{farmer.name}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem', color: '#475569', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📍 {farmer.location}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⭐ <strong style={{ color: farmer.score >= 80 ? '#166534' : farmer.score >= 50 ? '#92400e' : '#dc2626' }}>{farmer.score}/100</strong>
                <span style={{ color: '#94a3b8' }}>•</span> {farmer.ordersWithYou} orders with you
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🌾 {farmer.topCrops.join(', ')}</div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link href="/wholesaler/browse" className="btn btn-primary btn-sm" style={{ flex: 1, textAlign: 'center' }}>View Listings</Link>
              <Link href={`/wholesaler/rfq/new?farmer=${farmer.id}`} className="btn btn-outline btn-sm" style={{ flex: 1, textAlign: 'center' }}>Send RFQ</Link>
            </div>
          </div>
        ))}
      </div>

      {favourites.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">⭐</div>
          <div className="empty-state-title">No favourite suppliers</div>
          <div className="empty-state-text">Add farmers to your favourites for quick access to their listings.</div>
          <div style={{ marginTop: '1rem' }}>
            <Link href="/wholesaler/browse" className="btn btn-primary">Browse Farmers</Link>
          </div>
        </div>
      )}
    </div>
  );
}
