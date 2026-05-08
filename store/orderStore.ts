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
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => string;
  updateStatus: (id: string, status: OrderStatus) => void;
  confirmOrder: (id: string) => void;
  markOutForDelivery: (id: string) => void;
  confirmDelivery: (id: string, receivedKg: number) => void;
  completeOrder: (id: string) => void;
  cancelOrder: (id: string) => void;
  raiseDispute: (id: string, reason: string) => void;
  addReview: (id: string, rating: number, comment: string) => void;
  markPaid: (id: string, method: string) => void;
  getByBuyer: (buyerId: string) => Order[];
  getByFarmer: (farmerId: string) => Order[];
  getById: (id: string) => Order | undefined;
}

const now = new Date();
const ago = (days: number) => new Date(now.getTime() - days * 86400000).toISOString();

const SEED_ORDERS: Order[] = [
  {
    id: 'ORD-2041', buyerId: 'demo-consumer-001', buyerName: 'Priya Sharma',
    farmerId: 'demo-farmer-001', farmerName: 'Raju Patel', farmName: 'Patel Organic Farm',
    listingId: 'L001', cropName: 'Wheat (Lokwan)', orderType: 'B2C',
    quantityKg: 25, pricePerKg: 28, totalAmount: 700,
    orderStatus: 'PENDING', paymentStatus: 'PAID', paymentMethod: 'UPI',
    deliveryAddress: { label: 'Home', line1: '123 MG Road', city: 'Bhopal', state: 'MP', pincode: '462001' },
    createdAt: ago(1),
  },
  {
    id: 'ORD-2038', buyerId: 'demo-wholesaler-001', buyerName: 'Rajesh Agarwal',
    farmerId: 'demo-farmer-001', farmerName: 'Raju Patel', farmName: 'Patel Organic Farm',
    listingId: 'L002', cropName: 'Basmati Rice', orderType: 'B2B',
    quantityKg: 100, pricePerKg: 55, totalAmount: 5500,
    orderStatus: 'OUT_FOR_DELIVERY', paymentStatus: 'PAID', paymentMethod: 'Credit',
    deliveryAddress: { label: 'Warehouse', line1: 'Plot 45 Industrial Area', city: 'Indore', state: 'MP', pincode: '452001' },
    createdAt: ago(3), confirmedAt: ago(2), outForDeliveryAt: ago(1),
  },
  {
    id: 'ORD-2035', buyerId: 'demo-consumer-001', buyerName: 'Priya Sharma',
    farmerId: 'demo-farmer-001', farmerName: 'Raju Patel', farmName: 'Patel Organic Farm',
    listingId: 'L003', cropName: 'Onion (Red)', orderType: 'B2C',
    quantityKg: 50, receivedKg: 48, pricePerKg: 18, totalAmount: 900,
    orderStatus: 'COMPLETED', paymentStatus: 'PAID', paymentMethod: 'UPI',
    deliveryAddress: { label: 'Home', line1: '123 MG Road', city: 'Bhopal', state: 'MP', pincode: '462001' },
    createdAt: ago(6), confirmedAt: ago(5), outForDeliveryAt: ago(4), deliveredAt: ago(3), completedAt: ago(2),
    review: { rating: 5, comment: 'Very fresh onions, accurate quantity!', createdAt: ago(2) },
  },
  {
    id: 'ORD-2032', buyerId: 'demo-consumer-001', buyerName: 'Priya Sharma',
    farmerId: 'demo-farmer-004', farmerName: 'Venkat Rao', farmName: 'Rao Spice Farm',
    listingId: 'L006', cropName: 'Green Chili', orderType: 'B2C',
    quantityKg: 5, receivedKg: 5, pricePerKg: 45, totalAmount: 225,
    orderStatus: 'DELIVERED', paymentStatus: 'PAID', paymentMethod: 'UPI',
    deliveryAddress: { label: 'Home', line1: '123 MG Road', city: 'Bhopal', state: 'MP', pincode: '462001' },
    createdAt: ago(8), confirmedAt: ago(7), outForDeliveryAt: ago(6), deliveredAt: ago(5),
  },
  {
    id: 'ORD-2029', buyerId: 'demo-consumer-001', buyerName: 'Priya Sharma',
    farmerId: 'demo-farmer-002', farmerName: 'Suresh Kumar', farmName: 'Kumar Fresh Farms',
    listingId: 'L004', cropName: 'Fresh Tomatoes', orderType: 'B2C',
    quantityKg: 10, receivedKg: 10, pricePerKg: 15, totalAmount: 150,
    orderStatus: 'COMPLETED', paymentStatus: 'PAID', paymentMethod: 'UPI',
    deliveryAddress: { label: 'Home', line1: '123 MG Road', city: 'Bhopal', state: 'MP', pincode: '462001' },
    createdAt: ago(10), confirmedAt: ago(9), outForDeliveryAt: ago(8), deliveredAt: ago(7), completedAt: ago(6),
    review: { rating: 4, comment: 'Good tomatoes, slightly soft', createdAt: ago(6) },
  },
  {
    id: 'ORD-2026', buyerId: 'demo-wholesaler-001', buyerName: 'Rajesh Agarwal',
    farmerId: 'demo-farmer-005', farmerName: 'Dilip Sahu', farmName: 'Sahu Grains',
    listingId: 'L007', cropName: 'Maize (Yellow)', orderType: 'B2B',
    quantityKg: 500, receivedKg: 490, pricePerKg: 22, totalAmount: 11000,
    orderStatus: 'COMPLETED', paymentStatus: 'PAID', paymentMethod: 'Credit',
    deliveryAddress: { label: 'Warehouse', line1: 'Plot 45 Industrial Area', city: 'Indore', state: 'MP', pincode: '452001' },
    createdAt: ago(14), confirmedAt: ago(13), outForDeliveryAt: ago(12), deliveredAt: ago(11), completedAt: ago(10),
    review: { rating: 5, comment: 'Excellent quality maize, good packaging', createdAt: ago(10) },
  },
];

let orderCounter = 2050;

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: SEED_ORDERS,

      addOrder: (order) => {
        const id = `ORD-${++orderCounter}`;
        set((s) => ({ orders: [{ ...order, id, createdAt: new Date().toISOString() }, ...s.orders] }));
        return id;
      },

      updateStatus: (id, status) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, orderStatus: status } : o)) })),

      confirmOrder: (id) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, orderStatus: 'CONFIRMED' as const, confirmedAt: new Date().toISOString() } : o)) })),

      markOutForDelivery: (id) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, orderStatus: 'OUT_FOR_DELIVERY' as const, outForDeliveryAt: new Date().toISOString() } : o)) })),

      confirmDelivery: (id, receivedKg) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, orderStatus: 'DELIVERED' as const, deliveredAt: new Date().toISOString(), receivedKg } : o)) })),

      completeOrder: (id) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, orderStatus: 'COMPLETED' as const, completedAt: new Date().toISOString() } : o)) })),

      cancelOrder: (id) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, orderStatus: 'CANCELLED' as const } : o)) })),

      raiseDispute: (id, reason) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, orderStatus: 'DISPUTED' as const, disputeReason: reason, disputeRaisedAt: new Date().toISOString() } : o)) })),

      addReview: (id, rating, comment) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, review: { rating, comment, createdAt: new Date().toISOString() }, orderStatus: 'COMPLETED' as const, completedAt: new Date().toISOString() } : o)) })),

      markPaid: (id, method) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, paymentStatus: 'PAID' as const, paymentMethod: method } : o)) })),

      getByBuyer: (buyerId) => get().orders.filter((o) => o.buyerId === buyerId),
      getByFarmer: (farmerId) => get().orders.filter((o) => o.farmerId === farmerId),
      getById: (id) => get().orders.find((o) => o.id === id),
    }),
    { name: 'agriconnect-orders' }
  )
);
