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
  loginWithCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; password: string; phone?: string; role?: UserRole; farmName?: string; businessName?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

import { useCartStore } from './cartStore';

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (user: DemoUser) => {
        set({ user, isAuthenticated: true });
      },

      loginWithCredentials: async (email: string, password: string) => {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();

          if (!res.ok) {
            return { success: false, error: data.error || 'Login failed' };
          }

          set({ user: data.user, isAuthenticated: true });
          return { success: true };
        } catch (err) {
          return { success: false, error: String(err) };
        }
      },

      register: async (formData) => {
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
          const data = await res.json();

          if (!res.ok) {
            return { success: false, error: data.error || 'Registration failed' };
          }

          set({ user: data.user, isAuthenticated: true });
          return { success: true };
        } catch (err) {
          return { success: false, error: String(err) };
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
        if (typeof window !== 'undefined') {
          useCartStore.getState().clearCart();
          window.location.href = '/';
        }
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
