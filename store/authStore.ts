'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'CONSUMER' | 'FARMER' | 'WHOLESALER' | 'ADMIN';

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  farmName?: string;
  businessName?: string;
  accuracy?: number;
}

interface AuthStore {
  user: DemoUser | null;
  isAuthenticated: boolean;
  login: (user: DemoUser) => void;
  logout: () => void;
}

/**
 * Demo auth store — works without Supabase.
 * Persists to localStorage so login survives refresh.
 * Will be replaced with real Supabase auth when keys are added.
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (user: DemoUser) => {
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'agriconnect-auth',
    }
  )
);

// ── Preset demo accounts ────────────────────────────────────────────────────
export const DEMO_USERS: Record<UserRole, DemoUser> = {
  CONSUMER: {
    id: 'demo-consumer-001',
    name: 'Priya Sharma',
    email: 'priya@demo.agriconnect.app',
    phone: '+919876543210',
    role: 'CONSUMER',
    avatar: '👩',
  },
  FARMER: {
    id: 'demo-farmer-001',
    name: 'Raju Patel',
    email: 'raju@demo.agriconnect.app',
    phone: '+919123456780',
    role: 'FARMER',
    avatar: '👨‍🌾',
    farmName: 'Patel Organic Farm',
    accuracy: 94,
  },
  WHOLESALER: {
    id: 'demo-wholesaler-001',
    name: 'Rajesh Agarwal',
    email: 'rajesh@demo.agriconnect.app',
    phone: '+919988776655',
    role: 'WHOLESALER',
    avatar: '🏭',
    businessName: 'Rajdhani Agro Traders Pvt Ltd',
  },
  ADMIN: {
    id: 'demo-admin-001',
    name: 'Admin',
    email: 'admin@agriconnect.app',
    role: 'ADMIN',
    avatar: '⚙️',
  },
};
