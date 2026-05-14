'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore, type OrderStatus } from '@/store/orderStore';
import { useCartStore, type CartItem } from '@/store/cartStore';
import { useListingStore } from '@/store/listingStore';
import Header from '@/components/shared/Header';
import { Package, RefreshCw, ArrowRight, Star } from 'lucide-react';

type Tab = 'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

const statusConfig: Record<OrderStatus, { badge: string; color: string; isActive: boolean }> = {
  PENDING: { badge: 'badge-amber', color: '#F59E0B', isActive: true },
  CONFIRMED: { badge: 'badge-blue', color: '#3B82F6', isActive: true },
  OUT_FOR_DELIVERY: { badge: 'badge-purple', color: '#8B5CF6', isActive: true },
  DELIVERED: { badge: 'badge-green', color: '#059669', isActive: false },
  COMPLETED: { badge: 'badge-gray', color: '#6B7280', isActive: false },
  CANCELLED: { badge: 'badge-red', color: '#DC2626', isActive: false },
  DISPUTED: { badge: 'badge-red', color: '#DC2626', isActive: false },
};

function getCropImage(category?: string): string {
  switch (category) {
    case 'Grains': return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=100&q=80';
    case 'Vegetables': return 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=100&q=80';
    case 'Spices': return 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=100&q=80';
    default: return 'https://images.unsplash.com/photo-1595856720188-75f80b9125cc?auto=format&fit=crop&w=100&q=80';
  }
}

export default function ConsumerOrdersPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { orders } = useOrderStore();
  const { addItem } = useCartStore();
  const { getById: getListingById } = useListingStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>('ALL');

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && !isAuthenticated) router.push('/auth/consumer');
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !user) return null;

  const myOrders = orders.filter(o => o.buyerId === user.id);
  const filtered = tab === 'ALL' ? myOrders :
    tab === 'ACTIVE' ? myOrders.filter(o => ['PENDING', 'CONFIRMED', 'OUT_FOR_DELIVERY'].includes(o.orderStatus)) :
    tab === 'COMPLETED' ? myOrders.filter(o => ['DELIVERED', 'COMPLETED'].includes(o.orderStatus)) :
    myOrders.filter(o => ['CANCELLED', 'DISPUTED'].includes(o.orderStatus));

  const handleReorder = (order: typeof myOrders[0]) => {
    const listing = getListingById(order.listingId);
    const cartItem: CartItem = {
      id: `cart-${order.listingId}-${Date.now()}`,
      listing_id: order.listingId,
      quantity_kg: order.quantityKg,
      price_per_kg: order.pricePerKg,
      crop_name: order.cropName,
      farmer_name: order.farmerName,
      farmer_id: order.farmerId,
      min_order_kg: listing?.minOrderKg ?? 1,
      image_url: listing ? getCropImage(listing.category) : undefined,
    };
    addItem(cartItem);
    router.push('/cart');
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Header />
      <div className="container" style={{ padding: '1.5rem 1.5rem 3rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Package size={22} /> My Orders
        </h1>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: '1.5rem' }}>
          {(['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as Tab[]).map(t => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
              {t === 'ACTIVE' && (
                <span style={{
                  marginLeft: '0.3rem', fontSize: '0.7rem', background: 'var(--green-100)',
                  color: 'var(--green-900)', padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                }}>
                  {myOrders.filter(o => ['PENDING', 'CONFIRMED', 'OUT_FOR_DELIVERY'].includes(o.orderStatus)).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ fontSize: '3rem' }}><Package size={40} style={{ color: 'var(--text-muted)' }} /></div>
            <div className="empty-state-title">No orders found</div>
            <div className="empty-state-text">Browse the marketplace to place your first order!</div>
            <Link href="/marketplace" className="btn btn-primary" style={{ marginTop: '1rem' }}>Shop Now</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map(o => {
              const config = statusConfig[o.orderStatus];
              const listing = getListingById(o.listingId);
              const imageUrl = listing ? getCropImage(listing.category) : getCropImage();
              const isActiveOrder = config.isActive;

              return (
                <div
                  key={o.id}
                  className="card-flat"
                  style={{
                    padding: 0, overflow: 'hidden',
                    transition: 'box-shadow 0.15s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <Link href={`/orders/${o.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ display: 'flex', gap: '1rem', padding: '1.25rem' }}>
                      {/* Crop thumbnail */}
                      <div style={{
                        width: '4rem', height: '4rem', borderRadius: 'var(--radius-md)',
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: 'cover', backgroundPosition: 'center',
                        flexShrink: 0, border: '1px solid var(--border)',
                      }} />

                      {/* Order info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.35rem' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{o.cropName}</div>
                          <span style={{ fontWeight: 700, color: 'var(--green-900)', fontSize: '0.95rem' }}>₹{o.totalAmount.toLocaleString()}</span>
                        </div>

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                          {o.quantityKg} kg from {o.farmName}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span className={`badge ${config.badge}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            {isActiveOrder && <span className="status-pulse active" />}
                            {o.orderStatus.replace(/_/g, ' ')}
                          </span>
                          {o.review && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', fontSize: '0.75rem', color: '#F59E0B' }}>
                              <Star size={11} fill="#F59E0B" /> {o.review.rating}
                            </span>
                          )}
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                            {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Reorder button for completed orders */}
                  {['COMPLETED', 'DELIVERED'].includes(o.orderStatus) && (
                    <div style={{
                      borderTop: '1px solid var(--border)', padding: '0.5rem 1.25rem',
                      display: 'flex', justifyContent: 'flex-end',
                    }}>
                      <button
                        className="reorder-btn"
                        onClick={(e) => { e.stopPropagation(); handleReorder(o); }}
                      >
                        <RefreshCw size={11} /> Reorder <ArrowRight size={11} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
