'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRFQStore } from '@/store/rfqStore';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function RFQThread() {
  const params = useParams();
  const router = useRouter();
  const rfqId = params.id as string;
  
  const { user } = useAuthStore();
  const myId = user?.id ?? 'demo-wholesaler-001';

  const { getById, addMessage, updateRfqStatus } = useRFQStore();

  const [rfq, setRfq] = useState(getById(rfqId));
  const [newMessage, setNewMessage] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll for updates in the demo
  useEffect(() => {
    setMounted(true);
    
    // Simple polling since we're using local state and context doesn't
    // automatically trigger renders across browser tabs in this basic setup
    const interval = setInterval(() => {
      setRfq(getById(rfqId));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [rfqId, getById]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [rfq?.messages]);

  if (!mounted) return null;

  if (!rfq) {
    return (
      <div className="empty-state">
        <div className="empty-state-title">RFQ Not Found</div>
        <div className="empty-state-text">This RFQ may have been deleted or does not exist.</div>
        <Link href="/wholesaler/rfq" className="btn btn-primary mt-4">Back to RFQs</Link>
      </div>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    addMessage(rfq.id, {
      senderId: myId,
      senderRole: 'WHOLESALER',
      content: newMessage,
      pricePerKg: newPrice ? parseFloat(newPrice) : undefined,
      quantityKg: newQuantity ? parseInt(newQuantity) : undefined,
    });

    setNewMessage('');
    setNewPrice('');
    setNewQuantity('');
    
    // If the RFQ was COUNTERED by farmer, sending a new message sets it back to PENDING (negotiating)
    if (rfq.status === 'COUNTERED') {
      updateRfqStatus(rfq.id, 'PENDING');
    }
  };

  const handleAccept = () => {
    updateRfqStatus(rfq.id, 'ACCEPTED');
    setToast('🎉 Deal accepted! Order has been created.');
    setTimeout(() => router.push('/wholesaler/orders'), 2000);
  };

  const handleReject = () => {
    updateRfqStatus(rfq.id, 'REJECTED');
    setToast('RFQ closed.');
    setTimeout(() => router.push('/wholesaler/rfq'), 1200);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem',
          background: '#0f172a', color: '#fff',
          padding: '0.85rem 1.5rem', borderRadius: '10px',
          fontSize: '0.9rem', fontWeight: 600, zIndex: 2000,
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          animation: 'fadeIn 0.2s ease',
        }}>{toast}</div>
      )}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Link href="/wholesaler/rfq" className="btn btn-ghost" style={{ paddingLeft: 0 }}>← Back to RFQs</Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {rfq.cropName} — {rfq.farmerName}
            <span className={`badge ${
              rfq.status === 'PENDING' ? 'badge-blue' :
              rfq.status === 'COUNTERED' ? 'badge-amber' :
              rfq.status === 'ACCEPTED' ? 'badge-green' : 'badge-gray'
            }`}>
              {rfq.status}
            </span>
          </h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#14b8a6' }}>
            ₹{rfq.currentPricePerKg}/kg
          </div>
          <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
            for {rfq.currentQuantityKg} kg
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', minHeight: '400px', maxHeight: '600px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
          {rfq.messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', margin: 'auto' }}>
              No messages yet. Send an offer to start negotiating.
            </div>
          ) : (
            rfq.messages.map((msg) => {
              const isMe = msg.senderRole === 'WHOLESALER';
              return (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: isMe ? 'auto' : '0.5rem', marginRight: isMe ? '0.5rem' : 'auto' }}>
                    {msg.senderRole === 'SYSTEM' ? 'System' : (isMe ? 'You' : rfq.farmerName)}
                  </div>
                  <div style={{ 
                    padding: '0.75rem 1rem', 
                    borderRadius: '12px',
                    alignSelf: msg.senderRole === 'SYSTEM' ? 'center' : (isMe ? 'flex-end' : 'flex-start'),
                    background: msg.senderRole === 'SYSTEM' ? '#f8fafc' : (isMe ? '#14b8a6' : '#f1f5f9'),
                    color: msg.senderRole === 'SYSTEM' ? '#64748b' : (isMe ? 'white' : '#0f172a'),
                    border: msg.senderRole === 'SYSTEM' ? '1px solid #e2e8f0' : 'none',
                    maxWidth: '80%'
                  }}>
                    <div>{msg.content}</div>
                    {(msg.pricePerKg || msg.quantityKg) && (
                      <div style={{ 
                        marginTop: '0.5rem', 
                        paddingTop: '0.5rem', 
                        borderTop: isMe ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}>
                        Proposed: {msg.quantityKg ? `${msg.quantityKg}kg` : `${rfq.currentQuantityKg}kg`} @ {msg.pricePerKg ? `₹${msg.pricePerKg}/kg` : `₹${rfq.currentPricePerKg}/kg`}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#cbd5e1', marginLeft: msg.senderRole === 'SYSTEM' ? 'auto' : (isMe ? 'auto' : '0.5rem'), marginRight: msg.senderRole === 'SYSTEM' ? 'auto' : 0 }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {rfq.status === 'PENDING' || rfq.status === 'COUNTERED' ? (
        <>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>Quick Actions</h4>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={handleAccept}
                  style={{ background: '#10b981', borderColor: '#10b981' }}
                >
                  Accept Deal
                </button>
                <button className="btn btn-outline" onClick={handleReject}>Reject & Close</button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div className="form-group" style={{ flex: 1, margin: 0 }}>
                <label className="form-label">Update Price (₹/kg) <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>(Optional)</span></label>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder={`Current: ${rfq.currentPricePerKg}`}
                  className="input"
                  min="1"
                  step="0.1"
                />
              </div>
              <div className="form-group" style={{ flex: 1, margin: 0 }}>
                <label className="form-label">Update Qty (kg) <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>(Optional)</span></label>
                <input
                  type="number"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  placeholder={`Current: ${rfq.currentQuantityKg}`}
                  className="input"
                  min="1"
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message or counter-offer (500 chars max)"
                maxLength={500}
                className="input"
                style={{ flex: 1, minHeight: '80px', resize: 'vertical' }}
                required
              />
              <button type="submit" className="btn btn-primary" style={{ height: '80px', padding: '0 1.5rem' }}>
                Send Reply
              </button>
            </div>
          </form>
        </>
      ) : (
        <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
            This RFQ is {rfq.status.toLowerCase()}
          </h3>
          <p style={{ color: '#64748b' }}>
            {rfq.status === 'ACCEPTED' ? 'An order has been created for this negotiation.' : 'This negotiation has been closed.'}
          </p>
          {rfq.status === 'ACCEPTED' && (
            <Link href="/wholesaler/orders" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              View Orders
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
