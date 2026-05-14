'use client';

import { useState, useEffect } from 'react';
import { useAdminStore } from '@/store/adminStore';
import { Bell, Smartphone, MessageCircle, Mail, CheckCircle, Send } from 'lucide-react';

export default function AdminBroadcast() {
  const [mounted, setMounted] = useState(false);
  const { users, broadcastHistory, sendBroadcast } = useAdminStore();
  const [audience, setAudience] = useState('All Users');
  const [titleEn, setTitleEn] = useState('');
  const [titleHi, setTitleHi] = useState('');
  const [bodyEn, setBodyEn] = useState('');
  const [bodyHi, setBodyHi] = useState('');
  const [channelApp, setChannelApp] = useState(true);
  const [channelWhatsApp, setChannelWhatsApp] = useState(false);
  const [channelEmail, setChannelEmail] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const farmerCount = users.filter(u => u.role === 'FARMER' && u.status === 'ACTIVE').length * 28;
  const consumerCount = users.filter(u => u.role === 'CONSUMER' && u.status === 'ACTIVE').length * 99;
  const wholesalerCount = users.filter(u => u.role === 'WHOLESALER' && u.status === 'ACTIVE').length * 8;

  const getReach = () => {
    if (audience === 'Farmers Only') return farmerCount;
    if (audience === 'Consumers Only') return consumerCount;
    if (audience === 'Wholesalers Only') return wholesalerCount;
    return farmerCount + consumerCount + wholesalerCount;
  };

  const channels = [channelApp && 'In-app', channelWhatsApp && 'WhatsApp', channelEmail && 'Email'].filter(Boolean) as string[];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn || !bodyEn) { alert('Please fill the English title and body.'); return; }
    if (channels.length === 0) { alert('Please select at least one channel.'); return; }
    sendBroadcast({ id: `BC-${Date.now()}`, audience, titleEn, titleHi, bodyEn, bodyHi, channels, reach: getReach(), sentAt: new Date().toISOString() });
    setSent(true);
    setTimeout(() => { setSent(false); setTitleEn(''); setTitleHi(''); setBodyEn(''); setBodyHi(''); }, 2000);
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title"><Bell size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem' }} /> Broadcast Notifications</h1>
        <p className="page-subtitle">Send announcements and alerts to platform users</p>
      </div>

      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Target Audience</label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {['All Users', 'Farmers Only', 'Consumers Only', 'Wholesalers Only'].map(a => (
                <label key={a} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input type="radio" name="audience" checked={audience === a} onChange={() => setAudience(a)} /> {a}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Title (English)</label>
              <input type="text" className="input" placeholder="Up to 100 chars" maxLength={100} value={titleEn} onChange={e => setTitleEn(e.target.value)} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Title (Hindi)</label>
              <input type="text" className="input" placeholder="100 अक्षर तक" maxLength={100} value={titleHi} onChange={e => setTitleHi(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Body (English)</label>
              <textarea className="input" rows={4} placeholder="Up to 500 chars" maxLength={500} value={bodyEn} onChange={e => setBodyEn(e.target.value)} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Body (Hindi)</label>
              <textarea className="input" rows={4} placeholder="500 अक्षर तक" maxLength={500} value={bodyHi} onChange={e => setBodyHi(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="form-label">Delivery Channels</label>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={channelApp} onChange={() => setChannelApp(!channelApp)} style={{ width: '1.1rem', height: '1.1rem' }} />
                <Smartphone size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> In-app
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={channelWhatsApp} onChange={() => setChannelWhatsApp(!channelWhatsApp)} style={{ width: '1.1rem', height: '1.1rem' }} />
                <MessageCircle size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> WhatsApp
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={channelEmail} onChange={() => setChannelEmail(!channelEmail)} style={{ width: '1.1rem', height: '1.1rem' }} />
                <Mail size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Email
              </label>
            </div>
          </div>

          {titleEn && (
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>PREVIEW</div>
              <div style={{ padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.3rem' }}><Bell size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} /> AgriConnect Alert</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{titleEn}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>{bodyEn || 'Body text preview...'}</div>
              </div>
            </div>
          )}

          <div style={{ padding: '0.75rem 1rem', background: '#f0fdfa', borderRadius: '8px', border: '1px solid #ccfbf1', fontSize: '0.9rem', color: '#0f766e' }}>
            <strong>Estimated reach:</strong> <strong>{getReach().toLocaleString()} users</strong>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
            {sent ? (
              <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '8px', color: '#166534', fontWeight: 600, textAlign: 'center' }}>
                <CheckCircle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem' }} /> Broadcast sent successfully!
              </div>
            ) : (
              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
                <Send size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem' }} /> Send Notification
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Sent History</h2>
        {broadcastHistory.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No broadcasts sent yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  {['Date', 'Audience', 'Title', 'Reach', 'Channels'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.6rem 1rem', fontWeight: 600, fontSize: '0.85rem', color: '#475569' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {broadcastHistory.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', color: '#64748b' }}>{new Date(b.sentAt).toLocaleDateString()}</td>
                    <td style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}>{b.audience}</td>
                    <td style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', fontWeight: 500 }}>{b.titleEn}</td>
                    <td style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}>{b.reach.toLocaleString()}</td>
                    <td style={{ padding: '0.6rem 1rem', fontSize: '0.8rem' }}>{b.channels.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
