'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import DashboardNav from '@/components/shared/DashboardNav';

export default function ProfileEditPage() {
  const { user, isAuthenticated, login } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && !isAuthenticated) router.push('/auth/consumer');
    if (mounted && user) setForm({ name: user.name, email: user.email, phone: user.phone || '' });
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !user) return null;

  const handleSave = () => {
    login({ ...user, name: form.name, email: form.email, phone: form.phone });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <DashboardNav />
      <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '500px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem' }}>Edit Profile</h1>

        <div className="card" style={{ padding: '2rem' }}>
          <div className="form-group">
            <label className="label">Full Name</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', alignItems: 'center' }}>
            <Link href="/profile" className="btn btn-ghost">Cancel</Link>
            <button className="btn btn-primary" onClick={handleSave}>
              {saved ? '✓ Saved!' : '💾 Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
