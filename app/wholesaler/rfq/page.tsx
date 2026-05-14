'use client';

import Link from 'next/link';
import { useRFQStore } from '@/store/rfqStore';
import { useState, useEffect } from 'react';

export default function WholesalerRFQ() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  
  // Use demo wholesaler ID for the mock
  const DEMO_WHOLESALER_ID = 'demo-wholesaler-001';
  
  const { getByWholesaler } = useRFQStore();
  const rfqs = getByWholesaler(DEMO_WHOLESALER_ID);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Avoid hydration mismatch

  const tabs = ['All', 'Pending', 'Countered', 'Accepted', 'Rejected'];
  
  const filteredRfqs = activeTab === 'All' 
    ? rfqs 
    : rfqs.filter(r => r.status.toLowerCase() === activeTab.toLowerCase());

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">RFQ Requests</h1>
          <p className="page-subtitle">Negotiate with farmers for bulk orders</p>
        </div>
        <Link href="/wholesaler/rfq/new" className="btn btn-primary">
          + New RFQ
        </Link>
      </div>

      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        {tabs.map((tab) => (
          <button 
            key={tab} 
            className={`tab-btn ${tab === activeTab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredRfqs.map((rfq) => (
          <div key={rfq.id} className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e0f2f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                🌾
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      {rfq.cropName} · {rfq.currentQuantityKg}kg
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                      {rfq.farmerName}
                    </p>
                  </div>
                  <span className={`badge ${
                    rfq.status === 'PENDING' ? 'badge-blue' :
                    rfq.status === 'COUNTERED' ? 'badge-amber' :
                    rfq.status === 'ACCEPTED' ? 'badge-green' : 'badge-gray'
                  }`}>
                    {rfq.status}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                    Current Price: ₹{rfq.currentPricePerKg}/kg
                    {rfq.status === 'COUNTERED' && (
                      <span style={{ marginLeft: '1rem', fontWeight: 600, color: '#d97706' }}>
                        Needs your response
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Last Update: {new Date(rfq.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Link href={`/wholesaler/rfq/${rfq.id}`} className="btn btn-outline btn-sm">
                  {rfq.status === 'COUNTERED' ? 'View & Reply →' : 'Open Chat →'}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRfqs.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <div className="empty-state-title">No RFQs found</div>
          <div className="empty-state-text">
            {activeTab === 'All' 
              ? 'Send your first Request For Quote to a farmer.'
              : `You have no ${activeTab.toLowerCase()} RFQs.`}
          </div>
          {activeTab === 'All' && (
            <div style={{ marginTop: '1rem' }}>
              <Link href="/wholesaler/browse" className="btn btn-primary">Browse Farmers</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
