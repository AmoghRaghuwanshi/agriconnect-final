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
}

interface ListingStore {
  listings: Listing[];
  addListing: (listing: Omit<Listing, 'id' | 'createdAt' | 'views'>) => string;
  updateListing: (id: string, updates: Partial<Listing>) => void;
  pauseListing: (id: string) => void;
  resumeListing: (id: string) => void;
  deleteListing: (id: string) => void;
  getByFarmer: (farmerId: string) => Listing[];
  getActive: () => Listing[];
  getById: (id: string) => Listing | undefined;
}

const SEED_LISTINGS: Listing[] = [
  {
    id: 'L001', farmerId: 'demo-farmer-001', farmerName: 'Raju Patel', farmName: 'Patel Organic Farm',
    cropName: 'Wheat (Lokwan)', variety: 'Lokwan', category: 'Grains',
    quantityKg: 500, quantityRemaining: 500, pricePerKg: 28, minOrderKg: 10,
    harvestDate: '2026-05-01', storageType: 'Dry warehouse', description: 'Grade A, machine-cleaned premium wheat',
    images: [], status: 'ACTIVE', isB2b: true, isB2c: true,
    expiresAt: '2026-05-15T00:00:00Z', createdAt: '2026-05-01T10:00:00Z', views: 47,
    location: 'Indore, MP', state: 'Madhya Pradesh',
  },
  {
    id: 'L002', farmerId: 'demo-farmer-001', farmerName: 'Raju Patel', farmName: 'Patel Organic Farm',
    cropName: 'Basmati Rice', variety: 'Pusa 1121', category: 'Grains',
    quantityKg: 1000, quantityRemaining: 1000, pricePerKg: 55, minOrderKg: 25,
    harvestDate: '2026-04-28', storageType: 'Cold storage', description: 'Premium long-grain basmati',
    images: [], status: 'ACTIVE', isB2b: true, isB2c: true,
    expiresAt: '2026-05-20T00:00:00Z', createdAt: '2026-04-28T08:00:00Z', views: 89,
    location: 'Indore, MP', state: 'Madhya Pradesh',
  },
  {
    id: 'L003', farmerId: 'demo-farmer-001', farmerName: 'Raju Patel', farmName: 'Patel Organic Farm',
    cropName: 'Onion (Red)', variety: 'Nashik Red', category: 'Vegetables',
    quantityKg: 200, quantityRemaining: 0, pricePerKg: 18, minOrderKg: 20,
    harvestDate: '2026-04-20', storageType: 'Field-fresh', description: 'Fresh red onion, sorted',
    images: [], status: 'EXPIRED', isB2b: true, isB2c: true,
    expiresAt: '2026-05-05T00:00:00Z', createdAt: '2026-04-20T14:00:00Z', views: 122,
    location: 'Indore, MP', state: 'Madhya Pradesh',
  },
  {
    id: 'L004', farmerId: 'demo-farmer-002', farmerName: 'Suresh Kumar', farmName: 'Kumar Fresh Farms',
    cropName: 'Fresh Tomatoes', variety: 'Hybrid', category: 'Vegetables',
    quantityKg: 200, quantityRemaining: 200, pricePerKg: 15, minOrderKg: 5,
    harvestDate: '2026-05-06', storageType: 'Field-fresh', description: 'Vine-ripened, chemical-free tomatoes',
    images: [], status: 'ACTIVE', isB2b: false, isB2c: true,
    expiresAt: '2026-05-13T00:00:00Z', createdAt: '2026-05-06T09:00:00Z', views: 63,
    location: 'Nashik, MH', state: 'Maharashtra',
  },
  {
    id: 'L005', farmerId: 'demo-farmer-003', farmerName: 'Ramesh Patil', farmName: 'Patil Agro',
    cropName: 'Potato (Agra)', variety: 'Kufri Jyoti', category: 'Vegetables',
    quantityKg: 2000, quantityRemaining: 2000, pricePerKg: 12, minOrderKg: 50,
    harvestDate: '2026-04-25', storageType: 'Cold storage', description: 'Cold-stored A-grade potatoes',
    images: [], status: 'ACTIVE', isB2b: true, isB2c: true,
    expiresAt: '2026-05-25T00:00:00Z', createdAt: '2026-04-25T11:00:00Z', views: 156,
    location: 'Agra, UP', state: 'Uttar Pradesh',
  },
  {
    id: 'L006', farmerId: 'demo-farmer-004', farmerName: 'Venkat Rao', farmName: 'Rao Spice Farm',
    cropName: 'Green Chili', variety: 'Guntur Sannam', category: 'Spices',
    quantityKg: 100, quantityRemaining: 100, pricePerKg: 45, minOrderKg: 2,
    harvestDate: '2026-05-04', storageType: 'Field-fresh', description: 'Extremely spicy Guntur chili',
    images: [], status: 'ACTIVE', isB2b: true, isB2c: true,
    expiresAt: '2026-05-18T00:00:00Z', createdAt: '2026-05-04T07:00:00Z', views: 34,
    location: 'Guntur, AP', state: 'Andhra Pradesh',
  },
  {
    id: 'L007', farmerId: 'demo-farmer-005', farmerName: 'Dilip Sahu', farmName: 'Sahu Grains',
    cropName: 'Maize (Yellow)', variety: 'Pioneer', category: 'Grains',
    quantityKg: 3000, quantityRemaining: 3000, pricePerKg: 22, minOrderKg: 100,
    harvestDate: '2026-04-30', storageType: 'Dry warehouse', description: 'Feed-grade yellow maize',
    images: [], status: 'ACTIVE', isB2b: true, isB2c: false,
    expiresAt: '2026-05-30T00:00:00Z', createdAt: '2026-04-30T13:00:00Z', views: 78,
    location: 'Patna, BR', state: 'Bihar',
  },
  {
    id: 'L008', farmerId: 'demo-farmer-006', farmerName: 'Nagaraju Reddy', farmName: 'Reddy Turmeric Farm',
    cropName: 'Fresh Turmeric', variety: 'Salem', category: 'Spices',
    quantityKg: 150, quantityRemaining: 150, pricePerKg: 85, minOrderKg: 5,
    harvestDate: '2026-05-02', storageType: 'Dry warehouse', description: 'High-curcumin organic turmeric',
    images: [], status: 'ACTIVE', isB2b: true, isB2c: true,
    expiresAt: '2026-05-16T00:00:00Z', createdAt: '2026-05-02T10:00:00Z', views: 42,
    location: 'Nizamabad, TS', state: 'Telangana',
  },
];

let idCounter = 100;

export const useListingStore = create<ListingStore>()(
  persist(
    (set, get) => ({
      listings: SEED_LISTINGS,

      addListing: (listing) => {
        const id = `L${String(++idCounter).padStart(3, '0')}`;
        const newListing: Listing = {
          ...listing,
          id,
          createdAt: new Date().toISOString(),
          views: 0,
        };
        set((s) => ({ listings: [newListing, ...s.listings] }));
        return id;
      },

      updateListing: (id, updates) => {
        set((s) => ({
          listings: s.listings.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        }));
      },

      pauseListing: (id) => {
        set((s) => ({
          listings: s.listings.map((l) => (l.id === id ? { ...l, status: 'PAUSED' as const } : l)),
        }));
      },

      resumeListing: (id) => {
        set((s) => ({
          listings: s.listings.map((l) => (l.id === id ? { ...l, status: 'ACTIVE' as const } : l)),
        }));
      },

      deleteListing: (id) => {
        set((s) => ({
          listings: s.listings.map((l) => (l.id === id ? { ...l, status: 'EXPIRED' as const } : l)),
        }));
      },

      getByFarmer: (farmerId) => get().listings.filter((l) => l.farmerId === farmerId),
      getActive: () => get().listings.filter((l) => l.status === 'ACTIVE'),
      getById: (id) => get().listings.find((l) => l.id === id),
    }),
    { name: 'agriconnect-listings' }
  )
);
