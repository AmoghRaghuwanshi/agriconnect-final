'use client';

import { useRouter, notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore } from '@/store/orderStore';
import DashboardNav from '@/components/shared/DashboardNav';
import StatusTimeline from '@/components/shared/StatusTimeline';

export default function FarmerOrderDetailPage({ params }: { params: { id: string } }) {
  const { user, isAuthenticated } = useAuthStore();
  const { orders, confirmOrder, markOutForDelivery } = useOrderStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'FARMER')) router.push('/auth/farmer');
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !user) return null;

  const order = orders.find(o => o.id === params.id);
  if (!order) notFound();

  // Ownership check: farmers can only view orders assigned to them
  if (order.farmerId !== user.id) notFound();

  const actionButton = () => {
    switch (order.orderStatus) {
      case 'PENDING':
        return <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => confirmOrder(order.id)}>✓ Accept Order</button>;
      case 'CONFIRMED':
        return <button className="btn" style={{ width: '100%', justifyContent: 'center', background: '#7C3AED', color: '#fff' }} onClick={() => markOutForDelivery(order.id)}>🚚 Mark: Out for Delivery</button>;
      case 'OUT_FOR_DELIVERY':
        return <div className="alert alert-info"><span>📦</span><span>Awaiting buyer confirmation...</span></div>;
      case 'DELIVERED':
        return <div className="alert alert-success"><span>✅</span><span>Delivery confirmed by buyer</span></div>;
      case 'COMPLETED':
        return <div className="alert alert-success"><span>🎉</span><span>Order completed</span></div>;
      case 'DISPUTED':
        return <div className="alert alert-error"><span>⚠️</span><span>Dispute: {order.disputeReason}</span></div>;
      default: return null;
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <DashboardNav />
      <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
        <Link href="/farmer/orders" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>← Back to Orders</Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Order {order.id}</h1>
          <span className="badge badge-green" style={{ fontSize: '0.85rem' }}>₹{order.totalAmount.toLocaleString()}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Left — Timeline */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1rem', marginBottom: '1.5rem' }}>Status</h2>
            <StatusTimeline currentStatus={order.orderStatus} timestamps={{
              createdAt: order.createdAt, confirmedAt: order.confirmedAt,
              outForDeliveryAt: order.outForDeliveryAt, deliveredAt: order.deliveredAt,
              completedAt: order.completedAt,
            }} />
            <div style={{ marginTop: '1.5rem' }}>{actionButton()}</div>
          </div>

          {/* Right — Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>Buyer Info</h3>
              <div style={{ fontSize: '0.9rem', lineHeight: 1.8 }}>
                <div><strong>Name:</strong> {order.buyerName}</div>
                <div><strong>Type:</strong> {order.orderType}</div>
                <div><strong>Address:</strong> {order.deliveryAddress.line1}, {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.pincode}</div>
              </div>
            </div>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>Order Items</h3>
              <div style={{ fontSize: '0.9rem', lineHeight: 1.8 }}>
                <div><strong>Crop:</strong> {order.cropName}</div>
                <div><strong>Quantity:</strong> {order.quantityKg} kg</div>
                <div><strong>Price:</strong> ₹{order.pricePerKg}/kg</div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                  <strong>Total: ₹{order.totalAmount.toLocaleString()}</strong>
                </div>
              </div>
            </div>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem' }}>Payment</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span>Status</span>
                <span className={`badge ${order.paymentStatus === 'PAID' ? 'badge-green' : 'badge-amber'}`}>{order.paymentStatus}</span>
              </div>
              {order.paymentMethod && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Method: {order.paymentMethod}</div>}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
