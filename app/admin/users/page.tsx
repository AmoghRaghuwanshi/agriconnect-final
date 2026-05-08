'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import DashboardNav from '@/components/shared/DashboardNav';

interface UserRecord {
  id: string;
  name: string;
  role: string;
  contact: string;
  status: 'Active' | 'Suspended' | 'Pending KYC';
  joined: string;
}

const INITIAL_USERS: UserRecord[] = [
  { id: 'u1', name: 'Raju Patel', role: 'FARMER', contact: '+91 98765 43210', status: 'Active', joined: '1 Apr 2026' },
  { id: 'u2', name: 'Harish Kumar', role: 'FARMER', contact: '+91 98765 43218', status: 'Active', joined: '5 Apr 2026' },
  { id: 'u3', name: 'Sunita Kumari', role: 'FARMER', contact: '+91 98765 43220', status: 'Active', joined: '10 Apr 2026' },
  { id: 'u4', name: 'Priya Sharma', role: 'CONSUMER', contact: 'priya@demo.app', status: 'Active', joined: '15 Mar 2026' },
  { id: 'u5', name: 'Amit Kumar', role: 'CONSUMER', contact: 'amit@demo.app', status: 'Active', joined: '20 Mar 2026' },
  { id: 'u6', name: 'Anita Desai', role: 'CONSUMER', contact: 'anita@demo.app', status: 'Suspended', joined: '25 Mar 2026' },
  { id: 'u7', name: 'Rajesh Agarwal', role: 'WHOLESALER', contact: 'rajesh@vikas.com', status: 'Active', joined: '28 Mar 2026' },
  { id: 'u8', name: 'Metro Foods', role: 'WHOLESALER', contact: 'metro@demo.app', status: 'Pending KYC', joined: '28 Apr 2026' },
];

export default function AdminUsersPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [users, setUsers] = useState(INITIAL_USERS);
  const [viewingUser, setViewingUser] = useState<UserRecord | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'ADMIN')) router.push('/auth/admin');
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !user) return null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  let filtered = users;
  if (search) filtered = filtered.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.contact.toLowerCase().includes(search.toLowerCase()));
  if (roleFilter !== 'ALL') filtered = filtered.filter(u => u.role === roleFilter);

  const roleBadge: Record<string, string> = { FARMER: 'badge-green', CONSUMER: 'badge-blue', WHOLESALER: 'badge-purple' };

  const handleToggleStatus = (u: UserRecord) => {
    const newStatus = u.status === 'Active' ? 'Suspended' : 'Active';
    setUsers(prev => prev.map(usr => usr.id === u.id ? { ...usr, status: newStatus as 'Active' | 'Suspended' } : usr));
    showToast(`${newStatus === 'Suspended' ? '🚫' : '✅'} ${u.name} ${newStatus.toLowerCase()}`);
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <DashboardNav />
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>👥 Users ({users.length})</h1>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input className="input" placeholder="🔍 Search by name, email, phone..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: '250px' }} />
          <select className="input" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ width: 'auto' }}>
            <option value="ALL">All Roles</option>
            <option value="FARMER">Farmers</option>
            <option value="CONSUMER">Consumers</option>
            <option value="WHOLESALER">Wholesalers</option>
          </select>
        </div>

        <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '650px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                {['Name', 'Role', 'Contact', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.75rem 0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>{u.name}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}><span className={`badge ${roleBadge[u.role]}`}>{u.role}</span></td>
                  <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.contact}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}><span className={`badge ${u.status === 'Active' ? 'badge-green' : u.status === 'Suspended' ? 'badge-red' : 'badge-amber'}`}>{u.status}</span></td>
                  <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.joined}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setViewingUser(u)}>View</button>
                    <button className="btn btn-ghost btn-sm" style={{ color: u.status === 'Active' ? '#DC2626' : 'var(--green-900)' }}
                      onClick={() => handleToggleStatus(u)}>
                      {u.status === 'Active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View User Modal */}
      {viewingUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={(e) => { if (e.target === e.currentTarget) setViewingUser(null); }}>
          <div className="card" style={{ padding: '2rem', width: '90%', maxWidth: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>User Profile</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setViewingUser(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                ['Name', viewingUser.name],
                ['Role', viewingUser.role],
                ['Contact', viewingUser.contact],
                ['Status', viewingUser.status],
                ['Joined', viewingUser.joined],
                ['ID', viewingUser.id],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button className="btn btn-ghost" onClick={() => setViewingUser(null)}>Close</button>
              <button className={`btn ${viewingUser.status === 'Active' ? '' : 'btn-primary'}`}
                style={viewingUser.status === 'Active' ? { background: '#DC2626', color: '#fff' } : {}}
                onClick={() => { handleToggleStatus(viewingUser); setViewingUser(null); }}>
                {viewingUser.status === 'Active' ? '🚫 Suspend User' : '✅ Activate User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '0.75rem 1.5rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 200,
          fontWeight: 600, fontSize: '0.9rem', animation: 'fadeIn 0.3s ease',
        }}>
          {toast}
        </div>
      )}
    </main>
  );
}
