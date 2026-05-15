'use client';

import { useState, useEffect } from 'react';
import { FieldMapper } from '@/components/farmer/FieldMapper';
import DashboardNav from '@/components/shared/DashboardNav';
import { useRouter } from 'next/navigation';

export default function MyFieldsPage() {
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Add New Field States
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showMapper, setShowMapper] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [estimatedArea, setEstimatedArea] = useState('1'); // Default 1 ha
  
  // Hardcoded for demo - usually comes from auth context
  const farmerId = 'demo-farmer-001';

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      const res = await fetch(`/api/fields?farmerId=${farmerId}`);
      if (res.ok) {
        const data = await res.json();
        setFields(data.fields || []);
      }
    } catch (err) {
      console.error('Failed to fetch fields', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveField = async (fieldData: {
    coordinates: { lat: number; lng: number }[];
    areaHectares: number;
    centerLat: number;
    centerLng: number;
  }) => {
    if (!newFieldName) {
      alert("Please enter a name for this field first.");
      return;
    }

    try {
      const res = await fetch('/api/fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId,
          name: newFieldName,
          ...fieldData,
        }),
      });

      if (res.ok) {
        alert("Field saved successfully!");
        setShowAddMenu(false);
        setShowMapper(false);
        setNewFieldName('');
        fetchFields();
      } else {
        const data = await res.json();
        alert(`Error saving field: ${data.error}`);
      }
    } catch (err) {
      console.error('Error saving field', err);
      alert('Failed to save field.');
    }
  };

  const handleUseCurrentLocation = () => {
    if (!newFieldName) {
      alert("Please enter a name for this field first.");
      return;
    }
    
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    alert("Fetching your precise location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        handleSaveField({
          coordinates: [], // No boundary
          areaHectares: parseFloat(estimatedArea) || 1,
          centerLat: position.coords.latitude,
          centerLng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Geolocation error code:", error.code, "message:", error.message);
        const useFallback = window.confirm(
          `Location access failed (${error.message}).\n\nWould you like to use a simulated test location (Bhopal) instead?`
        );
        
        if (useFallback) {
          handleSaveField({
            coordinates: [],
            areaHectares: parseFloat(estimatedArea) || 1,
            centerLat: 23.2599, // Bhopal lat
            centerLng: 77.4126, // Bhopal lng
          });
        }
      },
      { timeout: 15000 } // Increased timeout, removed enableHighAccuracy which causes issues on desktops
    );
  };

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', paddingBottom: '4rem' }}>
      <DashboardNav />

      <main className="container" style={{ padding: '2rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-outfit), Outfit, sans-serif', fontWeight: 800, fontSize: '1.75rem', marginBottom: '0.25rem' }}>My Fields</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Manage your farmland boundaries for AI yield analysis</p>
          </div>
          {!showAddMenu && (
            <button className="btn btn-primary" onClick={() => setShowAddMenu(true)}>
              + Add New Field
            </button>
          )}
        </div>

        {showAddMenu && (
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.25rem' }}>Register New Field</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => { setShowAddMenu(false); setShowMapper(false); }}>Cancel</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', maxWidth: '600px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Field Name</label>
                <input 
                  type="text" 
                  className="input" 
                  value={newFieldName} 
                  onChange={e => setNewFieldName(e.target.value)}
                  placeholder="e.g., North Plot"
                  style={{ width: '100%' }}
                />
              </div>
              
              {!showMapper && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Estimated Area (Hectares)</label>
                  <input 
                    type="number" 
                    className="input" 
                    value={estimatedArea} 
                    onChange={e => setEstimatedArea(e.target.value)}
                    min="0.1" step="0.1"
                    style={{ width: '100%' }}
                  />
                </div>
              )}
            </div>

            {!showMapper ? (
              <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', maxWidth: '600px' }}>
                {/* Primary Option: Use Current Location (No Boundary) */}
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  onClick={handleUseCurrentLocation}
                >
                  <span style={{ fontSize: '1.2rem' }}>📍</span> 
                  <strong>Primary:</strong> Save Current Location (No Boundary)
                </button>

                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0' }}>— OR —</div>

                {/* Secondary Option: Draw on Map (With Boundary) */}
                <button 
                  className="btn btn-outline" 
                  style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  onClick={() => setShowMapper(true)}
                >
                  <span style={{ fontSize: '1.2rem' }}>🗺️</span> 
                  <strong>Secondary:</strong> Draw Field Boundary on Map
                </button>
              </div>
            ) : (
              <div>
                <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
                  <span>ℹ️</span>
                  <span>Use the polygon tool at the top center of the map to trace your field boundaries. The area will be calculated automatically.</span>
                </div>
                <FieldMapper onFieldDrawn={handleSaveField} />
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading fields...</div>
          ) : fields.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '4rem 2rem', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
              <h3 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.5rem' }}>No fields mapped yet</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Register your fields to enable AI yield forecasting and soil intelligence.</p>
              <button className="btn btn-primary" onClick={() => setShowAddMenu(true)}>Map My First Field</button>
            </div>
          ) : (
            fields.map(field => (
              <div key={field.id} style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>{field.name}</h3>
                  <span className="badge" style={{ background: 'var(--green-50)', color: 'var(--green-900)' }}>{field.area_ha} ha</span>
                </div>
                
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <strong>Boundary:</strong> {field.coordinates && field.coordinates.length > 0 ? 'Drawn' : 'Point Only'}
                  </div>
                  <div>
                    <strong>District:</strong> {field.district || 'Pending AI'}
                  </div>
                </div>

                <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => router.push(`/farmer/yield/${field.id}`)}>View AI Analysis</button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
