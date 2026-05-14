'use client';

import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * FloatingCartBar — Swiggy-style sticky bottom cart bar.
 * Appears when items are in the cart with a slide-up animation.
 * Shows item count + total, clicking navigates to /cart.
 */
export default function FloatingCartBar() {
  const { items, total, itemCount } = useCartStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const count = itemCount();
  const cartTotal = total();

  return (
    <div className={`floating-cart-bar ${count > 0 ? 'visible' : ''}`}>
      <div
        className="floating-cart-bar-inner"
        onClick={() => router.push('/cart')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') router.push('/cart'); }}
      >
        <div className="cart-bar-info">
          <div className="cart-bar-count">
            <ShoppingCart size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem' }} />
            {count} item{count !== 1 ? 's' : ''}
          </div>
          <div className="cart-bar-total">₹{cartTotal.toLocaleString()}</div>
        </div>
        <div className="cart-bar-action">
          View Cart <ArrowRight size={16} />
        </div>
      </div>
    </div>
  );
}
