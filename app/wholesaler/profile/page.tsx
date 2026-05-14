'use client';

import { useState, useEffect } from 'react';

export default function WholesalerProfile() {
  const [mounted, setMounted] = useState(false);
  
  // Mock data for demo
  const [profile, setProfile] = useState({
    businessName: 'Trading Co.',
    applicantName: 'Vikas Sharma',
    email: 'vikas@demo.agriconnect.app',
    phone: '+91 98765 43210',
    gstin: '07AABCB1234M1Z5',
    pan: 'AABCB1234M',
    address: '123 Mandi Marg, Azadpur, Delhi - 110033'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(formData);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Business Profile</h1>
          <p className="page-subtitle">Manage your company details and KYC information</p>
        </div>
        {!isEditing && (
          <button className="btn btn-outline" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        {!isEditing ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#e0f2f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                🏢
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{profile.businessName}</h2>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <span className="badge badge-green">KYC Verified</span>
                  <span className="badge badge-blue">Credit Limit: ₹5,00,000</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
              <div>
                <h4 style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Contact Person</h4>
                <p style={{ fontWeight: 500 }}>{profile.applicantName}</p>
              </div>
              <div>
                <h4 style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Registered Address</h4>
                <p style={{ fontWeight: 500 }}>{profile.address}</p>
              </div>
              <div>
                <h4 style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Email Address</h4>
                <p style={{ fontWeight: 500 }}>{profile.email}</p>
              </div>
              <div>
                <h4 style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Phone Number</h4>
                <p style={{ fontWeight: 500 }}>{profile.phone}</p>
              </div>
              <div>
                <h4 style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>GSTIN</h4>
                <p style={{ fontWeight: 500, fontFamily: 'monospace' }}>{profile.gstin}</p>
              </div>
              <div>
                <h4 style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>PAN</h4>
                <p style={{ fontWeight: 500, fontFamily: 'monospace' }}>{profile.pan}</p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Edit Details</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Business Name</label>
                <input 
                  type="text" 
                  className="input" 
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Contact Person</label>
                <input 
                  type="text" 
                  className="input" 
                  value={formData.applicantName}
                  onChange={(e) => setFormData({...formData, applicantName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="input" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Phone Number</label>
                <input 
                  type="tel" 
                  className="input" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Registered Address</label>
              <textarea 
                className="input" 
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                rows={2}
                required
              />
            </div>

            <div style={{ padding: '1rem', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fcd34d', fontSize: '0.9rem', color: '#92400e' }}>
              <strong>Note:</strong> GSTIN and PAN cannot be edited. If your tax details have changed, please contact Admin support to initiate a re-KYC process.
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary">Save Changes</button>
              <button type="button" className="btn btn-ghost" onClick={() => {
                setFormData(profile);
                setIsEditing(false);
              }}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
