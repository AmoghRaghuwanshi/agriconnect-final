'use client';

import { useState, useEffect } from 'react';
import { useAdminStore } from '@/store/adminStore';
import { Settings, AlertTriangle, Trash2, BarChart3, CheckCircle } from 'lucide-react';

export default function AdminSettings() {
  const [mounted, setMounted] = useState(false);
  const { platformConfig, updateConfig, syncMandiPrices } = useAdminStore();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const handleSave = (key: string) => {
    updateConfig(key, editValue);
    setEditingKey(null);
    setSaved(key);
    setTimeout(() => setSaved(null), 2000);
  };

  const handleForceSync = () => { syncMandiPrices(); alert('Mandi prices synced successfully!'); };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title"><Settings size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem' }} /> Platform Settings</h1>
        <p className="page-subtitle">Configure global rules, fees, and platform states</p>
      </div>

      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Platform Configuration</h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>All values are editable inline. Changes take effect immediately.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {platformConfig.map(c => (
            <div key={c.key} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9',
              background: saved === c.key ? '#f0fdf4' : 'transparent', transition: 'background 0.3s'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>{c.label}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.15rem' }}>{c.description}</div>
                <div style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: '0.1rem' }}>Last updated: {new Date(c.updatedAt).toLocaleString()} by {c.updatedBy}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem' }}>
                {editingKey === c.key ? (
                  <>
                    <input type="number" className="input" value={editValue} onChange={e => setEditValue(e.target.value)} style={{ width: '120px', textAlign: 'right', padding: '0.4rem 0.6rem' }} autoFocus />
                    <button className="btn btn-primary btn-sm" style={{ fontSize: '0.75rem' }} onClick={() => handleSave(c.key)}>Save</button>
                    <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem' }} onClick={() => setEditingKey(null)}>✕</button>
                  </>
                ) : (
                  <>
                    <span style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: 700, color: '#4338ca', background: '#eef2ff', padding: '0.3rem 0.75rem', borderRadius: '6px', minWidth: '60px', textAlign: 'right', display: 'inline-block' }}>
                      {c.label.includes('₹') || c.label.includes('Credit') || c.label.includes('Limit') ? `₹${Number(c.value).toLocaleString()}` :
                       c.label.includes('%') || c.label.includes('Commission') ? `${c.value}%` : c.value}
                    </span>
                    <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem' }} onClick={() => { setEditingKey(c.key); setEditValue(c.value); }}>
                      {saved === c.key ? <><CheckCircle size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.2rem' }} /> Saved</> : 'Edit'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: '2rem', border: '2px solid #fecaca', background: '#fff5f5' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#dc2626' }}><AlertTriangle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem' }} /> Danger Zone</h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>These actions are irreversible or affect the entire platform.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid #fecaca' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}><Trash2 size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} /> Clear All Demo Data</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Reset all demo data to seed defaults (staging only)</div>
            </div>
            <button className="btn btn-outline" style={{ borderColor: '#dc2626', color: '#dc2626', fontSize: '0.8rem' }} onClick={() => {
              if (confirm('Are you sure you want to clear all demo data? This will reset everything to defaults.')) {
                localStorage.removeItem('agriconnect-admin');
                localStorage.removeItem('agriconnect-orders');
                localStorage.removeItem('agriconnect-listings');
                window.location.reload();
              }
            }}>Clear Demo Data</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid #fecaca' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}><BarChart3 size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} /> Force Mandi Sync</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Immediately trigger a mandi price sync from APIs</div>
            </div>
            <button className="btn btn-outline" style={{ borderColor: '#d97706', color: '#d97706', fontSize: '0.8rem' }} onClick={handleForceSync}>Force Sync</button>
          </div>
        </div>
      </div>
    </div>
  );
}
