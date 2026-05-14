'use client';

import { useState, useEffect } from 'react';
import { useAdminStore } from '@/store/adminStore';
import { TrendingUp, RefreshCw, Plus, Download } from 'lucide-react';

export default function AdminMandiSync() {
  const [mounted, setMounted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { mandiPrices, mandiSyncHistory, syncMandiPrices, updateMandiPrice, addMandiPrice } = useAdminStore();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editMin, setEditMin] = useState(0);
  const [editModal, setEditModal] = useState(0);
  const [editMax, setEditMax] = useState(0);
  const [showAddRow, setShowAddRow] = useState(false);
  const [newCrop, setNewCrop] = useState('');
  const [newMandi, setNewMandi] = useState('');
  const [newState, setNewState] = useState('');
  const [newMin, setNewMin] = useState(0);
  const [newModal, setNewModal] = useState(0);
  const [newMax, setNewMax] = useState(0);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const handleSync = () => { setIsSyncing(true); setTimeout(() => { syncMandiPrices(); setIsSyncing(false); }, 2000); };

  const startEdit = (id: number) => {
    const p = mandiPrices.find(m => m.id === id);
    if (p) { setEditMin(p.minPrice); setEditModal(p.modalPrice); setEditMax(p.maxPrice); setEditingId(id); }
  };

  const saveEdit = () => {
    if (editingId !== null) { updateMandiPrice(editingId, { minPrice: editMin, modalPrice: editModal, maxPrice: editMax }); setEditingId(null); }
  };

  const handleAddRow = () => {
    if (!newCrop || !newMandi || !newState) return;
    addMandiPrice({ id: Date.now(), crop: newCrop, mandi: newMandi, state: newState, minPrice: newMin, modalPrice: newModal, maxPrice: newMax, lastUpdated: new Date().toISOString(), source: 'manual' });
    setShowAddRow(false); setNewCrop(''); setNewMandi(''); setNewState(''); setNewMin(0); setNewModal(0); setNewMax(0);
  };

  const exportCSV = () => {
    const header = 'Crop,Mandi,State,Min,Modal,Max,Last Updated,Source\n';
    const rows = mandiPrices.map(p => `${p.crop},${p.mandi},${p.state},${p.minPrice},${p.modalPrice},${p.maxPrice},${new Date(p.lastUpdated).toLocaleString()},${p.source}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'mandi_prices.csv'; a.click();
  };

  const lastSync = mandiSyncHistory[0];

  return (
    <div style={{ maxWidth: '1100px' }}>
      <div className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title"><TrendingUp size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem' }} /> Mandi Price Management</h1>
          <p className="page-subtitle">Monitor and manually sync prices from official sources</p>
        </div>
        <button className="btn btn-primary" onClick={handleSync} disabled={isSyncing} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isSyncing ? <><RefreshCw size={14} className="spin" /> Syncing...</> : <><RefreshCw size={14} /> Sync Now</>}
        </button>
      </div>

      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0fdfa', border: '1px solid #ccfbf1' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f766e', margin: 0 }}>Last sync: {lastSync ? `${new Date(lastSync.date).toLocaleString()} · Source: ${lastSync.source}` : 'Never'}</h3>
      </div>

      {mandiSyncHistory.length > 0 && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>Sync History (last 7)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {mandiSyncHistory.map((s, i) => (
              <div key={i} style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', gap: '0.75rem' }}>
                <span style={{ color: '#94a3b8' }}>{new Date(s.date).toLocaleString()}</span>
                <span>· {s.source}</span>
                <span style={{ color: '#059669', fontWeight: 500 }}>· {s.count} prices updated</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflowX: 'auto', marginBottom: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
              {['Crop', 'Mandi', 'State', 'Min (₹/kg)', 'Modal (₹/kg)', 'Max (₹/kg)', 'Last Updated', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: h.includes('₹') ? 'right' : 'left', padding: '0.75rem 1rem', fontWeight: 600, fontSize: '0.85rem', color: h === 'Modal (₹/kg)' ? '#1e40af' : '#475569' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mandiPrices.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{p.crop}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{p.mandi}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{p.state}</td>
                {editingId === p.id ? (
                  <>
                    <td style={{ padding: '0.5rem' }}><input type="number" className="input" value={editMin} onChange={e => setEditMin(Number(e.target.value))} style={{ width: '90px', textAlign: 'right', padding: '0.3rem' }} /></td>
                    <td style={{ padding: '0.5rem' }}><input type="number" className="input" value={editModal} onChange={e => setEditModal(Number(e.target.value))} style={{ width: '90px', textAlign: 'right', padding: '0.3rem' }} /></td>
                    <td style={{ padding: '0.5rem' }}><input type="number" className="input" value={editMax} onChange={e => setEditMax(Number(e.target.value))} style={{ width: '90px', textAlign: 'right', padding: '0.3rem' }} /></td>
                  </>
                ) : (
                  <>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#64748b' }}>₹{p.minPrice}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: '#1e40af' }}>₹{p.modalPrice}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#64748b' }}>₹{p.maxPrice}</td>
                  </>
                )}
                <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                  {new Date(p.lastUpdated).toLocaleString()}
                  {p.source === 'manual' && <span className="badge badge-amber" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>Manual</span>}
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  {editingId === p.id ? (
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button className="btn btn-primary btn-sm" style={{ fontSize: '0.7rem' }} onClick={saveEdit}>Save</button>
                      <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.7rem' }} onClick={() => setEditingId(null)}>✕</button>
                    </div>
                  ) : (
                    <button className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }} onClick={() => startEdit(p.id)}>Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddRow && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>Add New Price Row</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
            <input className="input" placeholder="Crop name" value={newCrop} onChange={e => setNewCrop(e.target.value)} />
            <input className="input" placeholder="Mandi" value={newMandi} onChange={e => setNewMandi(e.target.value)} />
            <input className="input" placeholder="State" value={newState} onChange={e => setNewState(e.target.value)} />
            <input type="number" className="input" placeholder="Min ₹" value={newMin || ''} onChange={e => setNewMin(Number(e.target.value))} />
            <input type="number" className="input" placeholder="Modal ₹" value={newModal || ''} onChange={e => setNewModal(Number(e.target.value))} />
            <input type="number" className="input" placeholder="Max ₹" value={newMax || ''} onChange={e => setNewMax(Number(e.target.value))} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" onClick={handleAddRow}>Add</button>
            <button className="btn btn-ghost" onClick={() => setShowAddRow(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        {!showAddRow && <button className="btn btn-outline" onClick={() => setShowAddRow(true)}><Plus size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} /> Add New Price Row</button>}
        <button className="btn btn-outline" onClick={exportCSV}><Download size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} /> Export CSV</button>
      </div>
    </div>
  );
}
