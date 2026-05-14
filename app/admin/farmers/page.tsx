'use client';

import { useState, useEffect } from 'react';
import { useAdminStore } from '@/store/adminStore';
import { Wheat, BadgeCheck, Clock, Download, CheckCircle } from 'lucide-react';

export default function AdminFarmers() {
  const [mounted, setMounted] = useState(false);
  const { farmers, verifyFarmer, updateFarmerScore } = useAdminStore();
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('All States');
  const [verifiedFilter, setVerifiedFilter] = useState('All');
  const [scoreModal, setScoreModal] = useState<string | null>(null);
  const [scoreField, setScoreField] = useState('scoreQuality');
  const [scoreValue, setScoreValue] = useState(0);
  const [scoreReason, setScoreReason] = useState('');
  const [verifyModal, setVerifyModal] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const states = Array.from(new Set(farmers.map(f => f.state)));

  const filtered = farmers.filter(f => {
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.farmName.toLowerCase().includes(search.toLowerCase());
    const matchState = stateFilter === 'All States' || f.state === stateFilter;
    const matchVerified = verifiedFilter === 'All' || (verifiedFilter === 'Verified' ? f.isVerified : !f.isVerified);
    return matchSearch && matchState && matchVerified;
  });

  const handleVerify = (userId: string) => { verifyFarmer(userId); setVerifyModal(null); };

  const handleScoreSave = () => {
    if (scoreModal) { updateFarmerScore(scoreModal, scoreField, scoreValue); setScoreModal(null); setScoreReason(''); }
  };

  const openScoreModal = (userId: string) => {
    const f = farmers.find(x => x.userId === userId);
    if (f) { setScoreValue(f.scoreQuality); setScoreField('scoreQuality'); }
    setScoreModal(userId);
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title"><Wheat size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem' }} /> Farmers</h1>
        <p className="page-subtitle">Manage farmer verifications and scores</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Search farmers..." className="input" style={{ flex: 1, minWidth: '250px' }} value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input" style={{ width: '150px' }} value={stateFilter} onChange={e => setStateFilter(e.target.value)}>
          <option>All States</option>
          {states.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="input" style={{ width: '150px' }} value={verifiedFilter} onChange={e => setVerifiedFilter(e.target.value)}>
          <option>All</option>
          <option>Verified</option>
          <option>Pending</option>
        </select>
      </div>

      <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
              {['Name', 'Farm', 'State', 'Score', 'Delivered', 'Verified', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, fontSize: '0.85rem', color: '#475569' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <tr key={f.userId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ fontWeight: 500 }}>{f.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{f.phone}</div>
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>{f.farmName}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{f.state}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span style={{ fontWeight: 600, color: f.scoreTotal >= 80 ? '#166534' : f.scoreTotal >= 50 ? '#92400e' : '#dc2626' }}>{f.scoreTotal}/100</span>
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>{f.totalDeliveredOrders}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span className={f.isVerified ? 'badge badge-green' : 'badge badge-gray'}>
                    {f.isVerified ? <><BadgeCheck size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Verified</> : <><Clock size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Pending</>}
                  </span>
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {!f.isVerified && (
                      <button className="btn btn-primary btn-sm" style={{ background: '#059669', borderColor: '#059669', fontSize: '0.75rem' }} onClick={() => setVerifyModal(f.userId)}>Verify</button>
                    )}
                    {f.isVerified && (
                      <button className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }} onClick={() => openScoreModal(f.userId)}>Edit Score</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state" style={{ padding: '3rem' }}>
            <div className="empty-state-icon"><Wheat size={40} style={{ color: 'var(--text-muted)' }} /></div>
            <div className="empty-state-title">No farmers found</div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{filtered.length} farmer{filtered.length !== 1 ? 's' : ''}</span>
        <button className="btn btn-outline"><Download size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} /> Export CSV</button>
      </div>

      {verifyModal && (() => {
        const f = farmers.find(x => x.userId === verifyModal);
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="card" style={{ padding: '2rem', maxWidth: '400px', width: '90%' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Verify {f?.name}?</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>This will mark them as a verified farmer. A WhatsApp notification will be sent: &quot;Badhai ho! Account verify ho gaya ✅&quot;</p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setVerifyModal(null)}>Cancel</button>
                <button className="btn btn-primary" style={{ background: '#059669', borderColor: '#059669' }} onClick={() => handleVerify(verifyModal)}><CheckCircle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.2rem' }} /> Verify Farmer</button>
              </div>
            </div>
          </div>
        );
      })()}

      {scoreModal && (() => {
        const f = farmers.find(x => x.userId === scoreModal);
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="card" style={{ padding: '2rem', maxWidth: '450px', width: '90%' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Edit Score — {f?.name}</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>Current Total: <strong>{f?.scoreTotal}/100</strong> (Q:{f?.scoreQuality} A:{f?.scoreAccuracy} P:{f?.scorePunctuality} V:{f?.scoreVolume})</p>
              <div className="form-group" style={{ margin: '0 0 1rem' }}>
                <label className="form-label">Score Type</label>
                <select className="input" value={scoreField} onChange={e => { setScoreField(e.target.value); const key = e.target.value as keyof typeof f; if (f && key) setScoreValue(Number(f[key]) || 0); }}>
                  <option value="scoreQuality">Quality</option>
                  <option value="scoreAccuracy">Accuracy</option>
                  <option value="scorePunctuality">Punctuality</option>
                  <option value="scoreVolume">Volume</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: '0 0 1rem' }}>
                <label className="form-label">New Value (0-100)</label>
                <input type="number" className="input" value={scoreValue} onChange={e => setScoreValue(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))} min={0} max={100} />
              </div>
              <div className="form-group" style={{ margin: '0 0 1.5rem' }}>
                <label className="form-label">Reason</label>
                <textarea className="input" rows={2} value={scoreReason} onChange={e => setScoreReason(e.target.value)} placeholder="Reason for manual override..." />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setScoreModal(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleScoreSave}>Save</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
