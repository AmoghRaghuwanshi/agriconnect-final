'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAdminStore } from '@/store/adminStore';
import { Users, CheckCircle, Ban, Download } from 'lucide-react';

export default function AdminUsers() {
  const [mounted, setMounted] = useState(false);
  const { users, suspendUser, activateUser } = useAdminStore();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [suspendModal, setSuspendModal] = useState<string | null>(null);
  const [suspendReason, setSuspendReason] = useState('Policy violation');

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search);
    const matchRole = roleFilter === 'All Roles' || u.role === roleFilter;
    const matchStatus = statusFilter === 'All Status' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const handleSuspend = (id: string) => { suspendUser(id, suspendReason); setSuspendModal(null); setSuspendReason('Policy violation'); };

  const exportCSV = () => {
    const header = 'Name,Role,Email,Phone,Status,Joined\n';
    const rows = filtered.map(u => `${u.name},${u.role},${u.email},${u.phone},${u.status},${u.joinDate}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'users.csv'; a.click();
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title"><Users size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem' }} /> Users</h1>
        <p className="page-subtitle">Manage all registered users</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Search by name, email, phone..." className="input" style={{ flex: 1, minWidth: '250px' }} value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input" style={{ width: '150px' }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option>All Roles</option><option>FARMER</option><option>CONSUMER</option><option>WHOLESALER</option><option>ADMIN</option>
        </select>
        <select className="input" style={{ width: '150px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option>All Status</option><option>ACTIVE</option><option>SUSPENDED</option>
        </select>
      </div>

      <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)', background: '#f8fafc' }}>
              {['Name', 'Role', 'Email / Phone', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, fontSize: '0.85rem', color: '#475569' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{u.name}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span className={`badge badge-${u.role === 'FARMER' ? 'green' : u.role === 'CONSUMER' ? 'olive' : u.role === 'WHOLESALER' ? 'blue' : 'gray'}`}>{u.role}</span>
                </td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
                  <div>{u.email}</div>
                  <div style={{ color: '#94a3b8' }}>{u.phone}</div>
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span className={u.status === 'ACTIVE' ? 'badge badge-green' : 'badge badge-red'}>
                    {u.status === 'ACTIVE' ? <><CheckCircle size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Active</> : <><Ban size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Suspended</>}
                  </span>
                </td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#64748b' }}>{new Date(u.joinDate).toLocaleDateString()}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {u.status === 'ACTIVE' ? (
                      <button className="btn btn-outline btn-sm" style={{ borderColor: '#ef4444', color: '#ef4444', fontSize: '0.75rem' }} onClick={() => setSuspendModal(u.id)}>Suspend</button>
                    ) : (
                      <button className="btn btn-outline btn-sm" style={{ borderColor: '#059669', color: '#059669', fontSize: '0.75rem' }} onClick={() => activateUser(u.id)}>Activate</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state" style={{ padding: '3rem' }}>
            <div className="empty-state-icon"><Users size={40} style={{ color: 'var(--text-muted)' }} /></div>
            <div className="empty-state-title">No users found</div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{filtered.length} user{filtered.length !== 1 ? 's' : ''} shown</span>
        <button className="btn btn-outline" onClick={exportCSV}><Download size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} /> Export CSV</button>
      </div>

      {suspendModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ padding: '2rem', maxWidth: '400px', width: '90%' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Suspend {users.find(u => u.id === suspendModal)?.name}?</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>This will immediately log them out and prevent access.</p>
            <div className="form-group" style={{ margin: '0 0 1rem' }}>
              <label className="form-label">Reason (required)</label>
              <select className="input" value={suspendReason} onChange={e => setSuspendReason(e.target.value)}>
                <option>Spam</option><option>Policy violation</option><option>Requested by user</option><option>Fraudulent activity</option><option>Other</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setSuspendModal(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ background: '#ef4444', borderColor: '#ef4444' }} onClick={() => handleSuspend(suspendModal)}>Confirm Suspend</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
