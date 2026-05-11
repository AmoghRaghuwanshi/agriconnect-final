'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Listing {
  id: string;
  farmerId: string;
  farmerName: string;
  farmName: string;
  cropName: string;
  variety: string;
  category: string;
  quantityKg: number;
  quantityRemaining: number;
  pricePerKg: number;
  minOrderKg: number;
  harvestDate: string;
  storageType: string;
  description: string;
  images: string[];
  status: 'ACTIVE' | 'PAUSED' | 'EXPIRED';
  isB2b: boolean;
  isB2c: boolean;
  expiresAt: string;
  createdAt: string;
  views: number;
  location: string;
  state: string;
  organic?: boolean;
}

interface ListingStore {
  listings: Listing[];
  isLoaded: boolean;
  fetchListings: (farmerId?: string) => Promise<void>;
  addListing: (listing: Omit<Listing, 'id' | 'createdAt' | 'views'>) => Promise<string>;
  updateListing: (id: string, updates: Partial<Listing>) => Promise<void>;
  pauseListing: (id: string) => Promise<void>;
  resumeListing: (id: string) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  getByFarmer: (farmerId: string) => Listing[];
  getActive: () => Listing[];
  getById: (id: string) => Listing | undefined;
}

export const useListingStore = create<ListingStore>()(
  persist(
    (set, get) => ({
      listings: [],
      isLoaded: false,

      fetchListings: async (farmerId?: string) => {
        try {
          const url = farmerId ? `/api/listings?farmerId=${farmerId}` : '/api/listings';
          const res = await fetch(url);
          const data = await res.json();
          if (data.listings && data.listings.length > 0) {
            set({ listings: data.listings, isLoaded: true });
          }
        } catch (err) {
          console.warn('[listings] API fetch failed, using local:', err);
        }
      },

      addListing: async (listing) => {
        // Create locally first for instant UI
        const tempId = `L${Date.now().toString(36).toUpperCase()}`;
        const newListing: Listing = {
          ...listing,
          id: tempId,
          createdAt: new Date().toISOString(),
          views: 0,
        };
        set((s) => ({ listings: [newListing, ...s.listings] }));

        // Sync to DB
        try {
          const res = await fetch('/api/listings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(listing),
          });
          const data = await res.json();
          if (data.id) {
            // Update local ID with server ID
            set((s) => ({
              listings: s.listings.map((l) =>
                l.id === tempId ? { ...l, id: data.id } : l
              ),
            }));
            return data.id;
          }
        } catch (err) {
          console.warn('[listings] API create failed:', err);
        }
        return tempId;
      },

      updateListing: async (id, updates) => {
        set((s) => ({
          listings: s.listings.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        }));
        try {
          await fetch('/api/listings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...updates }),
          });
        } catch (err) {
          console.warn('[listings] API update failed:', err);
        }
      },

      pauseListing: async (id) => {
        set((s) => ({
          listings: s.listings.map((l) => (l.id === id ? { ...l, status: 'PAUSED' as const } : l)),
        }));
        try {
          await fetch('/api/listings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status: 'PAUSED' }),
          });
        } catch (err) {
          console.warn('[listings] API pause failed:', err);
        }
      },

      resumeListing: async (id) => {
        set((s) => ({
          listings: s.listings.map((l) => (l.id === id ? { ...l, status: 'ACTIVE' as const } : l)),
        }));
        try {
          await fetch('/api/listings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status: 'ACTIVE' }),
          });
        } catch (err) {
          console.warn('[listings] API resume failed:', err);
        }
      },

      deleteListing: async (id) => {
        set((s) => ({
          listings: s.listings.map((l) => (l.id === id ? { ...l, status: 'EXPIRED' as const } : l)),
        }));
        try {
          await fetch(`/api/listings?id=${id}`, { method: 'DELETE' });
        } catch (err) {
          console.warn('[listings] API delete failed:', err);
        }
      },

      getByFarmer: (farmerId) => get().listings.filter((l) => l.farmerId === farmerId),
      getActive: () => get().listings.filter((l) => l.status === 'ACTIVE'),
      getById: (id) => get().listings.find((l) => l.id === id),
    }),
    { name: 'agriconnect-listings' }
  )
);
