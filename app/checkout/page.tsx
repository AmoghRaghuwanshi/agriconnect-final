'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore } from '@/store/orderStore';
import { useCartStore, type CartItem } from '@/store/cartStore';
import { useListingStore } from '@/store/listingStore';
import Header from '@/components/shared/Header';
import RecommendationSection from '@/components/shared/RecommendationSection';
import { useRecommendations } from '@/hooks/useRecommendations';
import { Check, ShieldCheck, MapPin } from 'lucide-react';

function getCropImageForListing(category: string, images?: string[]): string {
  if (images && images.length > 0) return images[0];
  switch (category) {
    case 'Grains': return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80';
    case 'Vegetables': return 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=400&q=80';
    case 'Spices': return 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80';
    case 'Fruits': return 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80';
    default: return 'https://images.unsplash.com/photo-1595856720188-75f80b9125cc?auto=format&fit=crop&w=400&q=80';
  }
}

export default function CheckoutPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { addOrder } = useOrderStore();
  const { items: cartItems, total, addItem, updateQuantity, removeItem } = useCartStore();
  const { getById: getListingById, listings } = useListingStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [address, setAddress] = useState({ label: 'Home', line1: '', city: '', state: '', pincode: '' });
  const [addressError, setAddressError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && !isAuthenticated) router.push('/auth/consumer');
  }, [mounted, isAuthenticated, router]);

  // Group items by farmer for display AND order creation
  type FarmerGroupItem = {
    listingId: string;
    cropName: string;
    quantityKg: number;
    pricePerKg: number;
    totalAmount: number;
  };

  interface FarmerGroup {
    farmerId: string;
    farmerName: string;
    farmName: string;
    items: FarmerGroupItem[];
  }

  const farmerGroups = useMemo(() => {
    const map = new Map<string, FarmerGroup>();
    for (const item of cartItems) {
      const listing = getListingById(item.listing_id);
      const farmName = listing?.farmName ?? 'Farm';

      let group = map.get(item.farmer_id);
      if (!group) {
        group = { farmerId: item.farmer_id, farmerName: item.farmer_name, farmName, items: [] };
        map.set(item.farmer_id, group);
      }
      group.items.push({
        listingId: item.listing_id,
        cropName: item.crop_name,
        quantityKg: item.quantity_kg,
        pricePerKg: item.price_per_kg,
        totalAmount: item.price_per_kg * item.quantity_kg,
      });
    }
    return Array.from(map.values());
  }, [cartItems, getListingById]);

  // ── Recommendations — "Add before you checkout" ──────────────────────
  const recoConfig = useMemo(() => {
    const cartCropNames = cartItems.map((i) => i.crop_name);
    const cartFarmerIds = [...new Set(cartItems.map((i) => i.farmer_id))];
    const cartListingIds = cartItems.map((i) => i.listing_id);
    const cartCategories = cartItems
      .map((i) => {
        const listing = listings.find((l) => l.id === i.listing_id);
        return listing?.category;
      })
      .filter(Boolean) as string[];
    return { cartCropNames, cartFarmerIds, cartListingIds, cartCategories, maxPerSection: 4, isB2B: false };
  }, [cartItems, listings]);

  const recommendations = useRecommendations(recoConfig);

  // Cart helpers for recommendation cards
  const getCartItem = useCallback(
    (listingId: string) => cartItems.find((i) => i.listing_id === listingId),
    [cartItems]
  );

  const handleRecoAdd = useCallback(
    (listing: { id: string; cropName: string; farmerName: string; farmerId: string; pricePerKg: number; minOrderKg: number; category: string; images: string[] }) => {
      const cartItem: CartItem = {
        id: `cart-${listing.id}-${Date.now()}`,
        listing_id: listing.id,
        quantity_kg: listing.minOrderKg,
        price_per_kg: listing.pricePerKg,
        crop_name: listing.cropName,
        farmer_name: listing.farmerName,
        farmer_id: listing.farmerId,
        min_order_kg: listing.minOrderKg,
        image_url: getCropImageForListing(listing.category, listing.images),
      };
      addItem(cartItem);
    },
    [addItem]
  );

  const handleRecoIncrement = useCallback(
    (listingId: string, currentQty: number, minOrder: number) => {
      updateQuantity(listingId, currentQty + minOrder);
    },
    [updateQuantity]
  );

  const handleRecoDecrement = useCallback(
    (listingId: string, currentQty: number, minOrder: number) => {
      const newQty = currentQty - minOrder;
      if (newQty <= 0) removeItem(listingId);
      else updateQuantity(listingId, newQty);
    },
    [updateQuantity, removeItem]
  );

  if (!mounted || !user) return null;

  // Redirect to marketplace if cart is empty
  if (cartItems.length === 0) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
        <Header />
        <div className="empty-state">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
          <div className="empty-state-title">Your cart is empty</div>
          <div className="empty-state-text">
            Add items from the marketplace before checking out.
          </div>
          <Link href="/marketplace" className="btn btn-primary">Browse Marketplace</Link>
        </div>
      </main>
    );
  }

  const subtotal = total();

  const handlePlaceOrder = async () => {
    if (!address.line1 || !address.city || !address.state || !address.pincode) {
      setAddressError('Please fill in all required address fields.');
      return;
    }
    if (address.pincode.length !== 6) {
      setAddressError('Please enter a valid 6-digit pincode.');
      return;
    }
    setAddressError('');
    setLoading(true);

    // Group items by farmer and create ONE order per farmer
    const orderIds: string[] = [];
    const orderData: { farmerId: string; farmerName: string; farmName: string; items: FarmerGroupItem[] }[] = [];

    for (const group of farmerGroups) {
      const totalAmount = group.items.reduce((sum, i) => sum + i.totalAmount, 0);
      const oid = await addOrder({
        buyerId: user.id,
        buyerName: user.name,
        farmerId: group.farmerId,
        farmerName: group.farmerName,
        farmName: group.farmName,
        listingId: group.items.map(i => i.listingId).join(','),
        cropName: group.items.map(i => i.cropName).join(', '),
        orderType: 'B2C',
        quantityKg: group.items.reduce((sum, i) => sum + i.quantityKg, 0),
        pricePerKg: totalAmount / group.items.reduce((sum, i) => sum + i.quantityKg, 0),
        totalAmount,
        orderStatus: 'PENDING',
        paymentStatus: 'PENDING',
        deliveryAddress: address,
      });
      orderIds.push(oid);
      orderData.push(group);
    }

    // Store order data in localStorage — survives tab close
    localStorage.setItem('checkout_order_ids', JSON.stringify(orderIds));
    localStorage.setItem('checkout_order_data', JSON.stringify(orderData));
    localStorage.setItem('checkout_total', String(subtotal));
    setTimeout(() => router.push('/checkout/payment'), 500);
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Header />
      <div className="container" style={{ padding: '2rem 1.5rem 4rem', maxWidth: '48rem', margin: '0 auto' }}>

        {/* Step Indicator */}
        <div className="step-indicator">
          <div className="step-item completed">
            <div className="step-dot"><Check size={12} /></div>
            <span className="hide-mobile">Cart</span>
          </div>
          <div className="step-line completed" />
          <div className="step-item active">
            <div className="step-dot">2</div>
            <span>Address</span>
          </div>
          <div className="step-line" />
          <div className="step-item">
            <div className="step-dot">3</div>
            <span>Payment</span>
          </div>
        </div>

        <h1 className="page-title" style={{ marginBottom: '2rem' }}>Checkout</h1>

        <div className="bento-2" style={{ alignItems: 'start' }}>
          {/* Left — Address + Items + Recommendations */}
          <div>
            {/* Address Form */}
            <div className="bill-breakdown" style={{ marginBottom: '1.25rem' }}>
              <h2 className="flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>
                <MapPin size={18} style={{ color: 'var(--green-700)' }} /> Delivery Address
              </h2>
              <div className="form-group">
                <label className="label">Label</label>
                <select className="input" value={address.label} onChange={e => setAddress(a => ({ ...a, label: e.target.value }))}>
                  <option>Home</option><option>Office</option><option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label">Address Line 1 *</label>
                <input className="input" placeholder="123 MG Road" value={address.line1} onChange={e => setAddress(a => ({ ...a, line1: e.target.value }))} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="label">City *</label>
                  <input className="input" placeholder="Bhopal" value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="label">State *</label>
                  <input className="input" placeholder="MP" value={address.state} onChange={e => setAddress(a => ({ ...a, state: e.target.value }))} required />
                </div>
              </div>
              <div className="form-group">
                <label className="label">Pincode *</label>
                <input className="input" placeholder="462001" value={address.pincode} onChange={e => setAddress(a => ({ ...a, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))} maxLength={6} required />
              </div>
              {addressError && (
                <div className="alert alert-error" style={{ marginTop: '0.75rem' }}>
                  ⚠️ {addressError}
                </div>
              )}
            </div>

            {/* Order Items grouped by farmer — display only, now 1 order per farmer */}
            <div className="bill-breakdown">
              <h2 className="flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem' }}>
                Orders ({farmerGroups.length} from {farmerGroups.length} farm{farmerGroups.length !== 1 ? 's' : ''})
              </h2>
              {farmerGroups.map((group, i) => (
                <div key={i} style={{ marginBottom: i < farmerGroups.length - 1 ? '1rem' : 0 }}>
                  <div className="label-cap" style={{ marginBottom: '0.5rem' }}>
                    Order for {group.farmerName}
                  </div>
                  {group.items.map(item => (
                    <div key={item.listingId} className="flex justify-between items-center" style={{
                      padding: '0.6rem 0', borderBottom: '1px solid rgba(0,0,0,0.04)',
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.cropName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.quantityKg} kg × ₹{item.pricePerKg}</div>
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        ₹{item.totalAmount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center" style={{ padding: '0.5rem 0 0', fontWeight: 700 }}>
                    <span>Order Total</span>
                    <span style={{ color: 'var(--green-900)' }}>₹{group.items.reduce((s, i) => s + i.totalAmount, 0).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* ── "Add before you checkout" Recommendations ─────────── */}
            {recommendations.length > 0 && (
              <div style={{ marginTop: '1.25rem' }}>
                {recommendations.slice(0, 1).map((group) => (
                  <RecommendationSection
                    key={group.title}
                    group={{
                      ...group,
                      title: 'Add before you checkout',
                      icon: '⚡',
                      items: group.items.slice(0, 4),
                    }}
                    variant="consumer"
                    collapsible
                    defaultOpen
                    onAdd={handleRecoAdd}
                    getCartItem={getCartItem}
                    onIncrement={handleRecoIncrement}
                    onDecrement={handleRecoDecrement}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right — Bill Summary */}
          <div style={{ position: 'sticky', top: '5rem' }}>
            <div className="bill-breakdown">
              <h2 className="flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem' }}>
                Bill Details
              </h2>

              <div className="bill-row">
                <span className="bill-label">Subtotal ({farmerGroups.length} order{farmerGroups.length !== 1 ? 's' : ''})</span>
                <span className="bill-value">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="bill-row">
                <span className="bill-label">Delivery</span>
                <span className="bill-free">FREE</span>
              </div>
              <div className="bill-row">
                <span className="bill-label">Platform Fee</span>
                <span className="bill-free">₹0</span>
              </div>

              <div className="flex items-center gap-2" style={{
                background: 'rgba(5, 150, 105, 0.05)', borderRadius: '8px',
                padding: '0.6rem 0.75rem', margin: '0.75rem 0', border: '1px solid rgba(5, 150, 105, 0.1)',
              }}>
                <ShieldCheck size={14} style={{ color: 'var(--green-700)', flexShrink: 0 }} />
                <div style={{ fontSize: '0.72rem', color: 'var(--green-900)' }}>
                  100% Quality Guarantee on all produce
                </div>
              </div>

              <div className="bill-row total">
                <span>Total</span>
                <span style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--green-900)', fontSize: '1.25rem' }}>
                  ₹{subtotal.toLocaleString()}
                </span>
              </div>

              <button
                className="btn btn-primary w-full"
                disabled={loading}
                style={{ justifyContent: 'center', marginTop: '1.25rem', padding: '0.875rem' }}
                onClick={handlePlaceOrder}
              >
                {loading ? <span className="spinner" style={{ width: '1rem', height: '1rem' }} /> : 'Proceed to Payment →'}
              </button>
              <Link href="/cart" className="btn btn-ghost btn-sm w-full" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
                ← Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
