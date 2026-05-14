'use client';

import Link from 'next/link';
import { useStandingOrderStore } from '@/store/standingOrderStore';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';

export default function WholesalerStandingOrders() {
  const [mounted, setMounted] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { user } = useAuthStore();
  const DEMO_ID = user?.id || 'demo-wholesaler-001';
  const MOCK_CREDIT = 44500;

  const { getByWholesaler, updateStatus, deleteOrder, addOrder } = useStandingOrderStore();
  const orders = getByWholesaler(DEMO_ID);

  // Create form state
  const [newCrop, setNewCrop] = useState('Wheat (Lokwan)');
  const [newFarmer, setNewFarmer] = useState('Raju Farms');
  const [newQty, setNewQty] = useState(200);
  const [newPrice, setNewPrice] = useState(21);
  const [newFreq, setNewFreq] = useState('WEEKLY');
  const [newDay, setNewDay] = useState(1);
  const [newNotes, setNewNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState(0);
  const [editPrice, setEditPrice] = useState(0);
  const [editFreq, setEditFreq] = useState('WEEKLY');

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const orderCost = newQty * newPrice;
  const creditSufficient = MOCK_CREDIT >= orderCost;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditSufficient) return;

    const nextExec = new Date();
    nextExec.setDate(nextExec.getDate() + (newDay - nextExec.getDay() + 7) % 7 || 7);

    addOrder({
      wholesalerId: DEMO_ID,
      farmerId: 'demo-farmer-001',
      farmerName: newFarmer,
      cropName: newCrop,
      quantityKg: newQty,
      pricePerKg: newPrice,
      frequency: newFreq as 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY',
      nextExecution: nextExec.toISOString(),
    });
    setShowCreateForm(false);
    setNewNotes('');
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">🔄 Standing Orders</h1>
          <p className="page-subtitle">Automated recurring purchases from your suppliers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? '✕ Close' : '+ New Standing Order'}
        </button>
      </div>

      {/* Credit Info */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: '#f0fdfa', border: '1px solid #ccfbf1' }}>
        <div style={{ fontSize: '1rem', color: '#0f766e', fontWeight: 600 }}>
          💳 Available Credit: ₹{MOCK_CREDIT.toLocaleString()}
        </div>
        <div style={{ fontSize: '0.85rem', color: '#14b8a6', marginTop: '0.25rem' }}>
          Credit is checked automatically before each standing order executes.
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem', border: '2px solid #14b8a6' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Create Standing Order</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Farmer (from favourites)</label>
                <select className="input" value={newFarmer} onChange={e => setNewFarmer(e.target.value)}>
                  <option>Raju Farms</option>
                  <option>H.K. Farms</option>
                  <option>Kumar Organic Farm</option>
                  <option>Venkat Agri</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Crop</label>
                <select className="input" value={newCrop} onChange={e => setNewCrop(e.target.value)}>
                  <option>Wheat (Lokwan)</option>
                  <option>Onion (Nashik Red)</option>
                  <option>Potato (Agra)</option>
                  <option>Basmati Rice</option>
                  <option>Green Chili</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Quantity per order (kg)</label>
                <input type="number" className="input" value={newQty} onChange={e => setNewQty(Number(e.target.value))} min={50} max={10000} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Price per kg (₹)</label>
                <input type="number" className="input" value={newPrice} onChange={e => setNewPrice(Number(e.target.value))} min={1} step={0.5} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Frequency</label>
                <select className="input" value={newFreq} onChange={e => setNewFreq(e.target.value)}>
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="BI_WEEKLY">Bi-weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>
              {(newFreq === 'WEEKLY' || newFreq === 'BI_WEEKLY') && (
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Day of Week</label>
                  <select className="input" value={newDay} onChange={e => setNewDay(Number(e.target.value))}>
                    {dayNames.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Notes (optional)</label>
              <textarea className="input" rows={2} value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="e.g. Need weekly delivery if deal works" />
            </div>

            {/* Credit Check */}
            <div style={{
              padding: '1rem', borderRadius: '8px', fontSize: '0.9rem',
              background: creditSufficient ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${creditSufficient ? '#bbf7d0' : '#fecaca'}`,
              color: creditSufficient ? '#166534' : '#991b1b'
            }}>
              This order costs <strong>₹{orderCost.toLocaleString()}/{newFreq.toLowerCase().replace('_', '-')}</strong>.<br />
              Available credit: ₹{MOCK_CREDIT.toLocaleString()} {creditSufficient ? '✓ Sufficient' : '✗ Insufficient — reduce quantity or price'}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary" disabled={!creditSufficient}>Create Standing Order</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowCreateForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Orders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {orders.map(order => (
          <div key={order.id} className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>🔄</span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                    {order.cropName} · {order.quantityKg}kg / {order.frequency.toLowerCase().replace('_', '-')}
                  </h3>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.25rem' }}>Supplier: {order.farmerName}</p>
                <p style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>
                  Locked Price: ₹{order.pricePerKg}/kg · Cost: ₹{(order.quantityKg * order.pricePerKg).toLocaleString()}/cycle
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`badge ${order.status === 'ACTIVE' ? 'badge-green' : order.status === 'PAUSED' ? 'badge-amber' : 'badge-gray'}`}>
                  {order.status}
                </span>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
                  Next Execution:<br />
                  <strong style={{ color: '#334155' }}>
                    {order.status === 'ACTIVE' ? new Date(order.nextExecution).toLocaleDateString() : '—'}
                  </strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
              {order.status === 'ACTIVE' ? (
                <button className="btn btn-sm btn-outline" onClick={() => updateStatus(order.id, 'PAUSED')}>⏸ Pause</button>
              ) : order.status === 'PAUSED' ? (
                <button className="btn btn-sm btn-primary" onClick={() => updateStatus(order.id, 'ACTIVE')}>▶ Resume</button>
              ) : null}
              <button
                className="btn btn-sm btn-outline"
                onClick={() => {
                  setEditingId(order.id);
                  setEditQty(order.quantityKg);
                  setEditPrice(order.pricePerKg);
                  setEditFreq(order.frequency);
                }}
              >
                ✏️ Edit
              </button>
              <button className="btn btn-sm btn-outline" style={{ borderColor: '#ef4444', color: '#ef4444' }}
                onClick={() => { if (confirm('Cancel this standing order?')) deleteOrder(order.id); }}>
                Cancel
              </button>
            </div>

            {/* Inline edit form */}
            {editingId === order.id && (
              <div style={{ marginTop: '1rem', padding: '1.25rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>Edit Standing Order</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Qty (kg)</label>
                    <input type="number" className="input" value={editQty} onChange={e => setEditQty(Number(e.target.value))} min={50} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Price (₹/kg)</label>
                    <input type="number" className="input" value={editPrice} onChange={e => setEditPrice(Number(e.target.value))} min={1} step={0.5} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Frequency</label>
                    <select className="input" value={editFreq} onChange={e => setEditFreq(e.target.value)}>
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="BI_WEEKLY">Bi-weekly</option>
                      <option value="MONTHLY">Monthly</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      // Delete old and re-add with new values (store pattern)
                      deleteOrder(order.id);
                      addOrder({
                        wholesalerId: order.wholesalerId,
                        farmerId: order.farmerId,
                        farmerName: order.farmerName,
                        cropName: order.cropName,
                        quantityKg: editQty,
                        pricePerKg: editPrice,
                        frequency: editFreq as 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY',
                        nextExecution: order.nextExecution,
                      });
                      setEditingId(null);
                    }}
                  >Save Changes</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {orders.length === 0 && !showCreateForm && (
        <div className="empty-state">
          <div className="empty-state-icon">🔄</div>
          <div className="empty-state-title">No standing orders</div>
          <div className="empty-state-text">Automate your supply chain by setting up recurring purchases with farmers.</div>
          <div style={{ marginTop: '1rem' }}>
            <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>Create Standing Order</button>
          </div>
        </div>
      )}
    </div>
  );
}
