'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED';

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  farmerName: string;
  farmName: string;
  listingId: string;
  cropName: string;
  orderType: 'B2C' | 'B2B';
  quantityKg: number;
  receivedKg?: number;
  pricePerKg: number;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  deliveryAddress: { label: string; line1: string; city: string; state: string; pincode: string };
  createdAt: string;
  confirmedAt?: string;
  outForDeliveryAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  disputeReason?: string;
  disputeRaisedAt?: string;
  review?: { rating: number; comment: string; createdAt: string };
}

interface OrderStore {
  orders: Order[];
  isLoaded: boolean;
  fetchOrders: (params?: { buyerId?: string; farmerId?: string }) => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Promise<string>;
  updateStatus: (id: string, status: OrderStatus) => void;
  confirmOrder: (id: string) => Promise<void>;
  markOutForDelivery: (id: string) => Promise<void>;
  confirmDelivery: (id: string, receivedKg: number) => Promise<void>;
  completeOrder: (id: string) => Promise<void>;
  cancelOrder: (id: string) => Promise<void>;
  raiseDispute: (id: string, reason: string) => Promise<void>;
  addReview: (id: string, rating: number, comment: string) => Promise<void>;
  markPaid: (id: string, method: string) => Promise<void>;
  getByBuyer: (buyerId: string) => Order[];
  getByFarmer: (farmerId: string) => Order[];
  getById: (id: string) => Order | undefined;
}

async function apiAction(id: string, action: string, data?: Record<string, unknown>) {
  try {
    await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action, ...data }),
    });
  } catch (err) {
    console.warn(`[orders] API ${action} failed:`, err);
  }
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      isLoaded: false,

      fetchOrders: async (params) => {
        try {
          let url = '/api/orders';
          if (params?.buyerId) url += `?buyerId=${params.buyerId}`;
          else if (params?.farmerId) url += `?farmerId=${params.farmerId}`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.orders && data.orders.length > 0) {
            set({ orders: data.orders, isLoaded: true });
          }
        } catch (err) {
          console.warn('[orders] API fetch failed:', err);
        }
      },

      addOrder: async (order) => {
        const tempId = `ORD-${Date.now().toString(36).toUpperCase()}`;
        const newOrder = { ...order, id: tempId, createdAt: new Date().toISOString() };
        set((s) => ({ orders: [newOrder, ...s.orders] }));

        try {
          const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order),
          });
          const data = await res.json();
          if (data.id) {
            set((s) => ({
              orders: s.orders.map((o) => (o.id === tempId ? { ...o, id: data.id } : o)),
            }));
            return data.id;
          }
        } catch (err) {
          console.warn('[orders] API create failed:', err);
        }
        return tempId;
      },

      updateStatus: (id, status) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, orderStatus: status } : o)) })),

      confirmOrder: async (id) => {
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, orderStatus: 'CONFIRMED' as const, confirmedAt: new Date().toISOString() } : o)) }));
        await apiAction(id, 'confirm');
      },

      markOutForDelivery: async (id) => {
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, orderStatus: 'OUT_FOR_DELIVERY' as const, outForDeliveryAt: new Date().toISOString() } : o)) }));
        await apiAction(id, 'ship');
      },

      confirmDelivery: async (id, receivedKg) => {
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, orderStatus: 'DELIVERED' as const, deliveredAt: new Date().toISOString(), receivedKg } : o)) }));
        await apiAction(id, 'deliver', { receivedKg });
      },

      completeOrder: async (id) => {
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, orderStatus: 'COMPLETED' as const, completedAt: new Date().toISOString() } : o)) }));
        await apiAction(id, 'complete');
      },

      cancelOrder: async (id) => {
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, orderStatus: 'CANCELLED' as const } : o)) }));
        await apiAction(id, 'cancel');
      },

      raiseDispute: async (id, reason) => {
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, orderStatus: 'DISPUTED' as const, disputeReason: reason, disputeRaisedAt: new Date().toISOString() } : o)) }));
        await apiAction(id, 'dispute', { reason });
      },

      addReview: async (id, rating, comment) => {
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, review: { rating, comment, createdAt: new Date().toISOString() }, orderStatus: 'COMPLETED' as const, completedAt: new Date().toISOString() } : o)) }));
        await apiAction(id, 'review', { rating, comment });
      },

      markPaid: async (id, method) => {
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, paymentStatus: 'PAID' as const, paymentMethod: method } : o)) }));
        await apiAction(id, 'pay', { method });
      },

      getByBuyer: (buyerId) => get().orders.filter((o) => o.buyerId === buyerId),
      getByFarmer: (farmerId) => get().orders.filter((o) => o.farmerId === farmerId),
      getById: (id) => get().orders.find((o) => o.id === id),
    }),
    { name: 'agriconnect-orders' }
  )
);
