'use client';

import { useRouter, notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore } from '@/store/orderStore';
import DashboardNav from '@/components/shared/DashboardNav';
import StatusTimeline from '@/components/shared/StatusTimeline';

export default function ConsumerOrderDetailPage({ params }: { params: { id: string } }) {
  const { user, isAuthenticated } = useAuthStore();
  const { orders, confirmDelivery, addReview, raiseDispute } = useOrderStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [receivedKg, setReceivedKg] = useState('');
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [disputeReason, setDisputeReason] = useState('');

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && !isAuthenticated) router.push('/auth/consumer');
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !user) return null;

  const order = orders.find(o => o.id === params.id);
  if (!order) notFound();

  // Ownership check: consumers can only view their own orders
  if (order.buyerId !== user.id) notFound();

  const handleConfirmDelivery = () => {
    confirmDelivery(order.id, parseFloat(receivedKg) || order.quantityKg);
    setShowReceiveModal(false);
  };

  const handleReview = () => {
    addReview(order.id, rating, comment);
    setShowReviewModal(false);
  };

  const handleDispute = () => {
    raiseDispute(order.id, disputeReason);
    setShowDisputeModal(false);
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <DashboardNav />
      <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
        <Link href="/orders" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>← Back to Orders</Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '1rem', marginBottom: '2rem' }}>Order {order.id}</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Timeline */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1rem', marginBottom: '1.5rem' }}>Status</h2>
            <StatusTimeline currentStatus={order.orderStatus} timestamps={{
              createdAt: order.createdAt, confirmedAt: order.confirmedAt,
              outForDeliveryAt: order.outForDeliveryAt, deliveredAt: order.deliveredAt,
              completedAt: order.completedAt,
            }} />

            {/* Actions */}
            <div style={{ marginTop: '1.5rem' }}>
              {order.orderStatus === 'OUT_FOR_DELIVERY' && (
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setShowReceiveModal(true)}>✓ I Received It</button>
              )}
              {order.orderStatus === 'DELIVERED' && !order.review && (
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setShowReviewModal(true)}>⭐ Leave a Review</button>
              )}
              {order.review && (
                <div className="card-flat" style={{ padding: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ color: '#F59E0B', letterSpacing: '2px', marginBottom: '0.3rem' }}>{'★'.repeat(order.review.rating)}{'☆'.repeat(5 - order.review.rating)}</div>
                  <div style={{ fontSize: '0.85rem' }}>"{order.review.comment}"</div>
                </div>
              )}
              {order.orderStatus === 'DELIVERED' && (
                <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem', color: '#DC2626' }}
                  onClick={() => setShowDisputeModal(true)}>⚠️ Report a Problem</button>
              )}
            </div>
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>From</h3>
              <div style={{ fontSize: '0.9rem', lineHeight: 1.8 }}>
                <div>👨‍🌾 <strong>{order.farmName}</strong></div>
                <div style={{ color: 'var(--text-muted)' }}>{order.farmerName}</div>
              </div>
            </div>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>Items</h3>
              <div style={{ fontSize: '0.9rem', lineHeight: 1.8 }}>
                <div>{order.cropName} · {order.quantityKg} kg × ₹{order.pricePerKg}</div>
                {order.receivedKg && <div style={{ color: 'var(--text-muted)' }}>Received: {order.receivedKg} kg</div>}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.5rem', marginTop: '0.5rem', fontWeight: 700, color: 'var(--green-900)' }}>Total: ₹{order.totalAmount.toLocaleString()}</div>
              </div>
            </div>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>Delivery To</h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <div style={{ fontWeight: 600 }}>{order.deliveryAddress.label}</div>
                <div>{order.deliveryAddress.line1}</div>
                <div>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.pincode}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showReceiveModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div className="card" style={{ padding: '2rem', width: '90%', maxWidth: '400px' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Confirm Delivery</h3>
              <div className="form-group">
                <label className="label">How much did you receive? (kg)</label>
                <input className="input" type="number" placeholder={String(order.quantityKg)} value={receivedKg} onChange={e => setReceivedKg(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button className="btn btn-ghost" onClick={() => setShowReceiveModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleConfirmDelivery}>Confirm Receipt ✓</button>
              </div>
            </div>
          </div>
        )}

        {showReviewModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div className="card" style={{ padding: '2rem', width: '90%', maxWidth: '400px' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Leave a Review</h3>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => setRating(s)} style={{ fontSize: '1.75rem', background: 'none', border: 'none', cursor: 'pointer', color: s <= rating ? '#F59E0B' : '#D1D5DB' }}>★</button>
                ))}
              </div>
              <div className="form-group">
                <label className="label">Comment (optional)</label>
                <textarea className="input" rows={3} placeholder="How was the produce?" value={comment} onChange={e => setComment(e.target.value)} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button className="btn btn-ghost" onClick={() => setShowReviewModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleReview}>Submit Review</button>
              </div>
            </div>
          </div>
        )}

        {showDisputeModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div className="card" style={{ padding: '2rem', width: '90%', maxWidth: '400px' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Report a Problem</h3>
              <div className="form-group">
                <label className="label">Describe the issue</label>
                <textarea className="input" rows={4} placeholder="e.g., Received only 80kg instead of 100kg" value={disputeReason} onChange={e => setDisputeReason(e.target.value)} style={{ resize: 'vertical' }} required />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button className="btn btn-ghost" onClick={() => setShowDisputeModal(false)}>Cancel</button>
                <button className="btn" style={{ background: '#DC2626', color: '#fff' }} onClick={handleDispute} disabled={!disputeReason}>Raise Dispute</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
