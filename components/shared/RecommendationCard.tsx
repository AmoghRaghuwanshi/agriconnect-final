'use client';

import Link from 'next/link';
import type { Listing } from '@/store/listingStore';
import type { CartItem } from '@/store/cartStore';
import { Plus, ShoppingCart } from 'lucide-react';

/* ── Crop image helper (matches marketplace logic) ──────────────────────── */
function getCropImage(category: string, images?: string[]): string {
  if (images && images.length > 0) return images[0];
  switch (category) {
    case 'Grains': return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80';
    case 'Vegetables': return 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=400&q=80';
    case 'Spices': return 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80';
    case 'Fruits': return 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80';
    default: return 'https://images.unsplash.com/photo-1595856720188-75f80b9125cc?auto=format&fit=crop&w=400&q=80';
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   ConsumerRecoCard — compact card for consumer cart/checkout recommendations
   ═══════════════════════════════════════════════════════════════════════════ */
interface ConsumerRecoCardProps {
  listing: Listing;
  reasonLabel: string;
  onAdd: (listing: Listing) => void;
  inCart?: boolean;
  cartQty?: number;
  onIncrement?: (listingId: string, currentQty: number, minOrder: number) => void;
  onDecrement?: (listingId: string, currentQty: number, minOrder: number) => void;
}

export function ConsumerRecoCard({
  listing,
  reasonLabel,
  onAdd,
  inCart = false,
  cartQty = 0,
  onIncrement,
  onDecrement,
}: ConsumerRecoCardProps) {
  const imageUrl = getCropImage(listing.category, listing.images);

  return (
    <div className="reco-card animate-fade-in-up" id={`reco-card-${listing.id}`}>
      {/* Badge */}
      <div className="reco-badge">{reasonLabel}</div>

      {/* Image */}
      <Link href={`/marketplace/${listing.id}`}>
        <div
          className="reco-card-img"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      </Link>

      {/* Info */}
      <div className="reco-card-body">
        <Link href={`/marketplace/${listing.id}`} style={{ textDecoration: 'none' }}>
          <div className="reco-card-name">{listing.cropName}</div>
        </Link>
        <div className="reco-card-variety">
          {listing.variety} · {listing.quantityRemaining.toLocaleString()} kg
        </div>
        <div className="reco-card-price">
          ₹{listing.pricePerKg}<span>/kg</span>
        </div>
        <div className="reco-card-farmer">{listing.farmerName}</div>

        {/* Add / Qty control */}
        {!inCart ? (
          <button
            className="reco-add-btn"
            onClick={() => onAdd(listing)}
            id={`reco-add-${listing.id}`}
          >
            <Plus size={14} /> ADD
          </button>
        ) : (
          <div className="reco-qty-control">
            <button
              onClick={() => onDecrement?.(listing.id, cartQty, listing.minOrderKg)}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span>{cartQty}</span>
            <button
              onClick={() => onIncrement?.(listing.id, cartQty, listing.minOrderKg)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   WholesalerRecoCard — compact card for B2B browse/orders recommendations
   ═══════════════════════════════════════════════════════════════════════════ */
interface WholesalerRecoCardProps {
  listing: Listing;
  reasonLabel: string;
  onPlaceOrder: (listing: Listing) => void;
  onRfq?: (listing: Listing) => void;
}

export function WholesalerRecoCard({
  listing,
  reasonLabel,
  onPlaceOrder,
  onRfq,
}: WholesalerRecoCardProps) {
  return (
    <div className="reco-card reco-card-b2b animate-fade-in-up" id={`reco-b2b-${listing.id}`}>
      <div className="reco-badge reco-badge-b2b">{reasonLabel}</div>

      <div className="reco-card-body">
        <div className="reco-card-name">{listing.cropName}</div>
        <div className="reco-card-variety">
          {listing.variety || 'Standard'} · {listing.quantityRemaining.toLocaleString()} kg avl
        </div>
        <div className="reco-card-price reco-price-b2b">
          ₹{listing.pricePerKg}<span>/kg</span>
        </div>
        <div className="reco-card-farmer">
          {listing.farmerName} · {listing.location || listing.state}
        </div>
        <div className="reco-card-detail">
          Min: {listing.minOrderKg} kg · {listing.storageType}
        </div>

        <div className="reco-b2b-actions">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onPlaceOrder(listing)}
            style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem' }}
          >
            <ShoppingCart size={12} /> Order
          </button>
          {onRfq && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => onRfq(listing)}
              style={{ fontSize: '0.78rem' }}
            >
              RFQ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
