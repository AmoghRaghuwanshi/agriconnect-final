'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore } from '@/store/orderStore';
import { useCartStore } from '@/store/cartStore';
import { useListingStore } from '@/store/listingStore';
import DashboardNav from '@/components/shared/DashboardNav';

export default function CheckoutPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { addOrder } = useOrderStore();
  const { items: cartItems, clearCart, total } = useCartStore();
  const { getById: getListingById } = useListingStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [address, setAddress] = useState({ label: 'Home', line1: '42 Arera Colony', city: 'Bhopal', state: 'MP', pincode: '462016' });
  const [addressError, setAddressError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && !isAuthenticated) router.push('/auth/consumer');
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !user) return null;

  // Redirect to marketplace if cart is empty
  if (cartItems.length === 0) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
        <DashboardNav />
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Your cart is empty</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
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

    // Group items by farmer and create one order per farmer-item
    const orderIds: string[] = [];
    for (const item of cartItems) {
      // Look up farmer details from the listing if available
      const listing = getListingById(item.listing_id);
      const farmName = listing?.farmName ?? 'Farm';

      const oid = await addOrder({
        buyerId: user.id, buyerName: user.name,
        farmerId: item.farmer_id, farmerName: item.farmer_name, farmName,
        listingId: item.listing_id, cropName: item.crop_name,
        orderType: 'B2C', quantityKg: item.quantity_kg, pricePerKg: item.price_per_kg,
        totalAmount: item.price_per_kg * item.quantity_kg,
        orderStatus: 'PENDING', paymentStatus: 'PENDING',
        deliveryAddress: address,
      });
      orderIds.push(oid);
    }

    // Store order IDs in sessionStorage — cart will be cleared AFTER payment succeeds
    sessionStorage.setItem('checkout_order_ids', JSON.stringify(orderIds));
    sessionStorage.setItem('checkout_total', String(subtotal));
    setTimeout(() => router.push('/checkout/payment'), 500);
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <DashboardNav />
      <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem' }}>🛒 Checkout</h1>

        <div className="grid-sidebar">
          {/* Left — Address + Items */}
          <div>
            <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>Delivery Address</h2>
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
                <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: '#FEF2F2', borderRadius: 'var(--radius-md)', border: '1px solid #FECACA', color: '#DC2626', fontSize: '0.85rem', fontWeight: 500 }}>
                  ⚠️ {addressError}
                </div>
              )}
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>Order Items ({cartItems.length})</h2>
              {cartItems.map(item => (
                <div key={item.listing_id} className="card-flat" style={{ padding: '1rem', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.crop_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>From {item.farmer_name} · {item.quantity_kg} kg × ₹{item.price_per_kg}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--green-900)' }}>₹{(item.price_per_kg * item.quantity_kg).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Summary */}
          <div className="card" style={{ padding: '2rem', alignSelf: 'flex-start', position: 'sticky', top: '5rem' }}>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>Order Summary</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
              <span>Subtotal ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</span><span style={{ fontWeight: 600 }}>₹{subtotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
              <span>Delivery</span><span style={{ fontWeight: 600, color: 'var(--green-900)' }}>FREE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
              <span>Platform Fee</span><span style={{ fontWeight: 600, color: 'var(--green-900)' }}>₹0</span>
            </div>
            <div style={{ borderTop: '2px solid var(--border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700 }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--green-900)' }}>₹{subtotal.toLocaleString()}</span>
            </div>
            <button className="btn btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem', padding: '0.875rem' }}
              onClick={handlePlaceOrder}>
              {loading ? <span className="spinner" style={{ width: '1rem', height: '1rem' }} /> : 'Proceed to Payment →'}
            </button>
            <Link href="/cart" className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>← Back to Cart</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
