'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  listing_id: string;
  quantity_kg: number;
  price_per_kg: number;
  crop_name: string;
  farmer_name: string;
  farmer_id: string;
  image_url?: string;
  max_order_kg?: number;
  min_order_kg?: number;
}

interface CartStore {
  items: CartItem[];
  isLoading: boolean;

  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (listingId: string) => void;
  updateQuantity: (listingId: string, quantity: number) => void;
  clearCart: () => void;

  // Computed
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.listing_id === item.listing_id
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.listing_id === item.listing_id
                  ? { ...i, quantity_kg: i.quantity_kg + item.quantity_kg }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        });
      },

      removeItem: (listingId) => {
        set((state) => ({
          items: state.items.filter((i) => i.listing_id !== listingId),
        }));
      },

      updateQuantity: (listingId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(listingId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.listing_id === listingId ? { ...i, quantity_kg: quantity } : i
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      total: () =>
        get().items.reduce(
          (sum, item) => sum + item.quantity_kg * item.price_per_kg,
          0
        ),

      itemCount: () => get().items.length,
    }),
    {
      name: 'agriconnect-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
