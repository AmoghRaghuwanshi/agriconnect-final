'use client';

import { useRef, useCallback, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import type { RecommendationGroup } from '@/hooks/useRecommendations';
import type { Listing } from '@/store/listingStore';
import { ConsumerRecoCard, WholesalerRecoCard } from './RecommendationCard';

/* ═══════════════════════════════════════════════════════════════════════════
   RecommendationSection — horizontal-scroll section for reco cards
   ═══════════════════════════════════════════════════════════════════════════ */

interface ConsumerSectionProps {
  group: RecommendationGroup;
  variant: 'consumer';
  onAdd: (listing: Listing) => void;
  getCartItem?: (listingId: string) => { quantity_kg: number } | undefined;
  onIncrement?: (listingId: string, qty: number, min: number) => void;
  onDecrement?: (listingId: string, qty: number, min: number) => void;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

interface WholesalerSectionProps {
  group: RecommendationGroup;
  variant: 'wholesaler';
  onPlaceOrder: (listing: Listing) => void;
  onRfq?: (listing: Listing) => void;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

type RecommendationSectionProps = ConsumerSectionProps | WholesalerSectionProps;

export default function RecommendationSection(props: RecommendationSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(props.defaultOpen ?? true);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  }, []);

  const { group, collapsible = false } = props;

  if (!group || group.items.length === 0) return null;

  return (
    <div className="reco-section animate-fade-in-up">
      {/* Section Header */}
      <div
        className={`reco-section-header ${collapsible ? 'reco-collapsible' : ''}`}
        onClick={collapsible ? () => setIsOpen((o) => !o) : undefined}
        role={collapsible ? 'button' : undefined}
        tabIndex={collapsible ? 0 : undefined}
      >
        <div className="reco-section-title">
          <span className="reco-section-icon">{group.icon}</span>
          {group.title}
          <span className="reco-section-count">{group.items.length}</span>
        </div>
        <div className="reco-section-controls">
          {collapsible && (
            isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />
          )}
          {!collapsible && group.items.length > 3 && (
            <>
              <button className="reco-scroll-btn" onClick={() => scroll('left')} aria-label="Scroll left">
                <ChevronLeft size={16} />
              </button>
              <button className="reco-scroll-btn" onClick={() => scroll('right')} aria-label="Scroll right">
                <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Scroll Container */}
      {isOpen && (
        <div className="reco-scroll" ref={scrollRef}>
          {group.items.map((item) => {
            if (props.variant === 'consumer') {
              const { onAdd, getCartItem, onIncrement, onDecrement } = props;
              const cartItem = getCartItem?.(item.listing.id);
              return (
                <ConsumerRecoCard
                  key={item.listing.id}
                  listing={item.listing}
                  reasonLabel={item.reasonLabel}
                  onAdd={onAdd}
                  inCart={!!cartItem}
                  cartQty={cartItem?.quantity_kg ?? 0}
                  onIncrement={onIncrement}
                  onDecrement={onDecrement}
                />
              );
            } else {
              const { onPlaceOrder, onRfq } = props;
              return (
                <WholesalerRecoCard
                  key={item.listing.id}
                  listing={item.listing}
                  reasonLabel={item.reasonLabel}
                  onPlaceOrder={onPlaceOrder}
                  onRfq={onRfq}
                />
              );
            }
          })}
        </div>
      )}
    </div>
  );
}
