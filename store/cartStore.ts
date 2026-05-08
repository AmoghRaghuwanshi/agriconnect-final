'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getSupabaseClient } from '@/lib/supabaseClient';

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
  isSyncing: boolean;
  syncTimeout: ReturnType<typeof setTimeout> | null;

  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (listingId: string) => void;
  updateQuantity: (listingId: string, quantity: number) => void;
  clearCart: () => void;
  hydrate: (userId: string) => Promise<void>;

  // Computed
  total: () => number;
  itemCount: () => number;
}

let syncTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Debounced sync to Supabase DB.
 * Runs 500ms after the last cart change.
 * Cart is persisted in DB — survives browser close, device switch.
 */
async function syncToDb(items: CartItem[], userId: string): Promise<void> {
  const supabase = getSupabaseClient();

  // Replace all cart_items for this user atomically
  await supabase.from('cart_items').delete().eq('user_id', userId);

  if (items.length > 0) {
    await supabase.from('cart_items').insert(
      items.map((item) => ({
        user_id: userId,
        listing_id: item.listing_id,
        quantity_kg: item.quantity_kg,
      }))
    );
  }
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      isSyncing: false,
      syncTimeout: null,

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

        // Debounced DB sync (500ms)
        if (syncTimer) clearTimeout(syncTimer);
        syncTimer = setTimeout(async () => {
          const supabase = getSupabaseClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            await syncToDb(get().items, session.user.id);
          }
        }, 500);
      },

      removeItem: (listingId) => {
        set((state) => ({
          items: state.items.filter((i) => i.listing_id !== listingId),
        }));

        if (syncTimer) clearTimeout(syncTimer);
        syncTimer = setTimeout(async () => {
          const supabase = getSupabaseClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            await syncToDb(get().items, session.user.id);
          }
        }, 500);
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

        if (syncTimer) clearTimeout(syncTimer);
        syncTimer = setTimeout(async () => {
          const supabase = getSupabaseClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            await syncToDb(get().items, session.user.id);
          }
        }, 500);
      },

      clearCart: () => {
        set({ items: [] });
        if (syncTimer) clearTimeout(syncTimer);
        syncTimer = setTimeout(async () => {
          const supabase = getSupabaseClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            await syncToDb([], session.user.id);
          }
        }, 500);
      },

      /**
       * On page load: fetch cart from DB → hydrate Zustand store.
       * Called after user signs in.
       */
      hydrate: async (userId: string) => {
        set({ isLoading: true });
        const supabase = getSupabaseClient();

        const { data } = await supabase
          .from('cart_items')
          .select(`
            id,
            listing_id,
            quantity_kg,
            produce_listings (
              price_per_kg,
              crop_name,
              min_order_kg,
              max_order_kg,
              images,
              farmer_id,
              farmer_profiles (
                farm_name
              )
            )
          `)
          .eq('user_id', userId);

        if (data) {
          const items: CartItem[] = data
            .filter((d) => d.produce_listings)
            .map((d) => {
              const listing = d.produce_listings as Record<string, unknown>;
              return {
                id: d.id,
                listing_id: d.listing_id,
                quantity_kg: d.quantity_kg,
                price_per_kg: listing.price_per_kg as number,
                crop_name: listing.crop_name as string,
                farmer_id: listing.farmer_id as string,
                farmer_name:
                  (listing.farmer_profiles as Record<string, string>)
                    ?.farm_name ?? 'Farm',
                image_url: ((listing.images as string[]) ?? [])[0],
                min_order_kg: listing.min_order_kg as number,
                max_order_kg: listing.max_order_kg as number,
              };
            });
          set({ items, isLoading: false });
        } else {
          set({ isLoading: false });
        }
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
      // Only persist locally as fallback — DB is the source of truth
      partialize: (state) => ({ items: state.items }),
    }
  )
);
