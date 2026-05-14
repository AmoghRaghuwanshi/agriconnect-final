'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface KYCApplication {
  id: string; wholesalerId: string; businessName: string; applicantName: string;
  gstin: string; pan: string; businessType: string; email: string; phone: string;
  state: string; status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string; creditLimit?: number; internalNote?: string;
}

export interface Dispute {
  id: string; orderId: string; buyerName: string; buyerEmail: string; buyerPhone: string;
  farmerName: string; farmerState: string; farmerPhone: string;
  cropName: string; quantityKg: number; pricePerKg: number; receivedKg: number;
  amount: number; reason: string; photoUrl?: string;
  status: 'OPEN' | 'RESOLVED_REFUND_FULL' | 'RESOLVED_REFUND_PARTIAL' | 'RESOLVED_REJECTED';
  createdAt: string; orderCreatedAt: string; resolvedAt?: string; resolutionNote?: string;
}

export interface UserSummary {
  id: string; name: string; email: string; phone: string;
  role: 'FARMER' | 'CONSUMER' | 'WHOLESALER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED'; joinDate: string; suspendReason?: string;
}

export interface FarmerProfile {
  userId: string; name: string; farmName: string; village: string; district: string;
  state: string; phone: string; isVerified: boolean;
  scoreTotal: number; scoreQuality: number; scoreAccuracy: number;
  scorePunctuality: number; scoreVolume: number;
  totalDeliveredOrders: number; isActive: boolean;
}

export interface MandiPrice {
  id: number; crop: string; mandi: string; state: string;
  minPrice: number; modalPrice: number; maxPrice: number;
  lastUpdated: string; source: string;
}

export interface BroadcastNotification {
  id: string; audience: string; titleEn: string; titleHi: string;
  bodyEn: string; bodyHi: string;
  channels: string[]; reach: number; sentAt: string;
}

export interface PlatformConfig {
  key: string; value: string; label: string; description: string;
  type: 'number' | 'toggle'; updatedAt: string; updatedBy: string;
}

export interface ActivityFeedItem {
  id: string; icon: string; text: string; time: string;
}

// ── Seed Data ─────────────────────────────────────────────────────────────────

const SEED_KYC: KYCApplication[] = [
  { id: 'KYC-001', wholesalerId: 'demo-wholesaler-002', businessName: 'FreshMart Logistics', applicantName: 'Amit Sharma', gstin: '27AADCB2230M1Z2', pan: 'AADCB2230M', businessType: 'Cold Storage & Distribution', email: 'amit@freshmart.in', phone: '+91 98765 11111', state: 'Maharashtra', status: 'PENDING', submittedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'KYC-002', wholesalerId: 'demo-wholesaler-003', businessName: 'Kisan Fresh Supply', applicantName: 'Priya Singh', gstin: '09AAACA1122M1Z5', pan: 'AAACA1122M', businessType: 'Cloud Kitchen', email: 'priya@kisanfresh.in', phone: '+91 98765 22222', state: 'Uttar Pradesh', status: 'PENDING', submittedAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'KYC-003', wholesalerId: 'demo-wholesaler-004', businessName: 'Metro Foods Pvt Ltd', applicantName: 'Rajesh Gupta', gstin: '07AABCM1234F1Z5', pan: 'AABCM1234F', businessType: 'Restaurant Chain', email: 'rajesh@metrofoods.in', phone: '+91 98765 33333', state: 'Delhi', status: 'PENDING', submittedAt: new Date(Date.now() - 259200000).toISOString() },
];

const SEED_DISPUTES: Dispute[] = [
  { id: 'DSP-001', orderId: 'ORD-2045', buyerName: 'Rahul Verma', buyerEmail: 'rahul@demo.app', buyerPhone: '+91 98765 43210', farmerName: 'Suresh Kumar', farmerState: 'Maharashtra', farmerPhone: '+91 91234 56780', cropName: 'Fresh Tomatoes', quantityKg: 5, pricePerKg: 15, receivedKg: 3, amount: 3000, reason: 'Quality issue: Tomatoes arrived damaged and rotten.', status: 'OPEN', createdAt: new Date(Date.now() - 259200000).toISOString(), orderCreatedAt: new Date(Date.now() - 432000000).toISOString() },
  { id: 'DSP-002', orderId: 'ORD-2041', buyerName: 'Vikas Trading Co.', buyerEmail: 'vikas@demo.app', buyerPhone: '+91 98765 54321', farmerName: 'Raju Patel', farmerState: 'Madhya Pradesh', farmerPhone: '+91 91234 56789', cropName: 'Wheat (Lokwan)', quantityKg: 500, pricePerKg: 28, receivedKg: 480, amount: 560, reason: 'Quantity mismatch: Received 480kg instead of 500kg.', status: 'OPEN', createdAt: new Date(Date.now() - 86400000).toISOString(), orderCreatedAt: new Date(Date.now() - 259200000).toISOString() },
  { id: 'DSP-003', orderId: 'ORD-2039', buyerName: 'Anita Desai', buyerEmail: 'anita@demo.app', buyerPhone: '+91 98765 99999', farmerName: 'Venkat Rao', farmerState: 'Karnataka', farmerPhone: '+91 91234 11111', cropName: 'Green Chili', quantityKg: 10, pricePerKg: 45, receivedKg: 10, amount: 450, reason: 'Quality issue: Chilies were not as described, mostly yellow not green.', status: 'OPEN', createdAt: new Date(Date.now() - 432000000).toISOString(), orderCreatedAt: new Date(Date.now() - 518400000).toISOString() },
];

const SEED_USERS: UserSummary[] = [
  { id: 'demo-farmer-001', name: 'Raju Patel', email: 'raju@demo.app', phone: '+91 98765 43210', role: 'FARMER', status: 'ACTIVE', joinDate: '2026-01-15' },
  { id: 'demo-farmer-002', name: 'Suresh Kumar', email: 'suresh@demo.app', phone: '+91 91234 56780', role: 'FARMER', status: 'ACTIVE', joinDate: '2026-02-10' },
  { id: 'demo-farmer-003', name: 'Sunita Devi', email: 'sunita@demo.app', phone: '+91 91234 67890', role: 'FARMER', status: 'ACTIVE', joinDate: '2026-03-05' },
  { id: 'demo-farmer-004', name: 'Harish Kumar', email: 'harish@demo.app', phone: '+91 91234 78901', role: 'FARMER', status: 'ACTIVE', joinDate: '2026-03-20' },
  { id: 'demo-farmer-005', name: 'Venkat Rao', email: 'venkat@demo.app', phone: '+91 91234 11111', role: 'FARMER', status: 'ACTIVE', joinDate: '2026-04-01' },
  { id: 'demo-consumer-001', name: 'Rahul Verma', email: 'rahul@demo.app', phone: '+91 98765 54321', role: 'CONSUMER', status: 'ACTIVE', joinDate: '2026-03-10' },
  { id: 'demo-consumer-002', name: 'Priya Sharma', email: 'priya@demo.app', phone: '+91 98765 65432', role: 'CONSUMER', status: 'ACTIVE', joinDate: '2026-02-15' },
  { id: 'demo-consumer-003', name: 'Anita Desai', email: 'anita@demo.app', phone: '+91 98765 99999', role: 'CONSUMER', status: 'ACTIVE', joinDate: '2026-04-05' },
  { id: 'demo-wholesaler-001', name: 'Vikas Trading Co.', email: 'vikas@demo.app', phone: '+91 98765 76543', role: 'WHOLESALER', status: 'ACTIVE', joinDate: '2026-02-05' },
  { id: 'demo-farmer-bad', name: 'Bad Actor Farm', email: 'bad@demo.app', phone: '+91 00000 00000', role: 'FARMER', status: 'SUSPENDED', joinDate: '2026-04-20', suspendReason: 'Policy violation' },
];

const SEED_FARMERS: FarmerProfile[] = [
  { userId: 'demo-farmer-001', name: 'Raju Patel', farmName: 'Raju Farms', village: 'Sehore', district: 'Sehore', state: 'MP', phone: '+91 98765 43210', isVerified: true, scoreTotal: 84, scoreQuality: 88, scoreAccuracy: 82, scorePunctuality: 80, scoreVolume: 86, totalDeliveredOrders: 12, isActive: true },
  { userId: 'demo-farmer-002', name: 'Suresh Kumar', farmName: 'Kumar Organic Farm', village: 'Nashik', district: 'Nashik', state: 'MH', phone: '+91 91234 56780', isVerified: true, scoreTotal: 71, scoreQuality: 75, scoreAccuracy: 68, scorePunctuality: 72, scoreVolume: 69, totalDeliveredOrders: 8, isActive: true },
  { userId: 'demo-farmer-003', name: 'Sunita Devi', farmName: 'Sunita Farm', village: 'Varanasi', district: 'Varanasi', state: 'UP', phone: '+91 91234 67890', isVerified: false, scoreTotal: 0, scoreQuality: 0, scoreAccuracy: 0, scorePunctuality: 0, scoreVolume: 0, totalDeliveredOrders: 0, isActive: true },
  { userId: 'demo-farmer-004', name: 'Harish Kumar', farmName: 'H.K. Farms', village: 'Lucknow', district: 'Lucknow', state: 'UP', phone: '+91 91234 78901', isVerified: true, scoreTotal: 91, scoreQuality: 93, scoreAccuracy: 90, scorePunctuality: 88, scoreVolume: 93, totalDeliveredOrders: 18, isActive: true },
  { userId: 'demo-farmer-005', name: 'Venkat Rao', farmName: 'Venkat Agri', village: 'Kolar', district: 'Kolar', state: 'KA', phone: '+91 91234 11111', isVerified: true, scoreTotal: 65, scoreQuality: 60, scoreAccuracy: 70, scorePunctuality: 65, scoreVolume: 65, totalDeliveredOrders: 5, isActive: true },
];

const SEED_MANDI: MandiPrice[] = [
  { id: 1, crop: 'Wheat', mandi: 'Bhopal', state: 'MP', minPrice: 2050, modalPrice: 2100, maxPrice: 2180, lastUpdated: new Date(Date.now() - 7200000).toISOString(), source: 'data.gov.in' },
  { id: 2, crop: 'Onion', mandi: 'Lasalgaon', state: 'MH', minPrice: 800, modalPrice: 1050, maxPrice: 1200, lastUpdated: new Date(Date.now() - 7200000).toISOString(), source: 'data.gov.in' },
  { id: 3, crop: 'Potato', mandi: 'Agra', state: 'UP', minPrice: 1000, modalPrice: 1150, maxPrice: 1400, lastUpdated: new Date(Date.now() - 7200000).toISOString(), source: 'data.gov.in' },
  { id: 4, crop: 'Tomato', mandi: 'Kolar', state: 'KA', minPrice: 800, modalPrice: 1200, maxPrice: 1500, lastUpdated: new Date(Date.now() - 7200000).toISOString(), source: 'eNAM' },
  { id: 5, crop: 'Rice (Basmati)', mandi: 'Amritsar', state: 'PB', minPrice: 4500, modalPrice: 5200, maxPrice: 6000, lastUpdated: new Date(Date.now() - 7200000).toISOString(), source: 'eNAM' },
  { id: 6, crop: 'Green Chili', mandi: 'Guntur', state: 'AP', minPrice: 3000, modalPrice: 4500, maxPrice: 5500, lastUpdated: new Date(Date.now() - 7200000).toISOString(), source: 'Agmarknet' },
];

const SEED_BROADCASTS: BroadcastNotification[] = [
  { id: 'BC-001', audience: 'All Users', titleEn: 'Platform Maintenance', titleHi: 'प्लेटफ़ॉर्म रखरखाव', bodyEn: 'Scheduled maintenance on May 12 from 2-4 AM IST.', bodyHi: '12 मई को सुबह 2-4 बजे IST रखरखाव निर्धारित है।', channels: ['In-app', 'WhatsApp'], reach: 1056, sentAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'BC-002', audience: 'Farmers Only', titleEn: 'Kharif Season Tips', titleHi: 'खरीफ सीजन टिप्स', bodyEn: 'Get ready for Kharif season. List your produce early!', bodyHi: 'खरीफ सीजन की तैयारी करें।', channels: ['In-app', 'WhatsApp'], reach: 142, sentAt: new Date(Date.now() - 432000000).toISOString() },
];

const SEED_CONFIG: PlatformConfig[] = [
  { key: 'default_credit_limit', value: '25000', label: 'Default Credit Limit', description: 'Default credit limit assigned to new wholesalers (₹)', type: 'number', updatedAt: new Date().toISOString(), updatedBy: 'System' },
  { key: 'dispute_auto_close_days', value: '7', label: 'Dispute Auto-close (days)', description: 'Days before unresolved disputes are auto-closed', type: 'number', updatedAt: new Date().toISOString(), updatedBy: 'System' },
  { key: 'delivery_auto_complete_days', value: '3', label: 'Delivery Auto-complete (days)', description: 'Days after delivery when order auto-completes', type: 'number', updatedAt: new Date().toISOString(), updatedBy: 'System' },
  { key: 'platform_commission', value: '0', label: 'Platform Commission (%)', description: 'Commission charged on each order', type: 'number', updatedAt: new Date().toISOString(), updatedBy: 'System' },
  { key: 'max_standing_order_qty', value: '10000', label: 'Max Standing Order Qty (kg)', description: 'Maximum quantity for standing orders', type: 'number', updatedAt: new Date().toISOString(), updatedBy: 'System' },
  { key: 'min_orders_score_public', value: '3', label: 'Min Orders Before Score Public', description: 'Minimum delivered orders before farmer score is visible', type: 'number', updatedAt: new Date().toISOString(), updatedBy: 'System' },
  { key: 'mandi_sync_frequency', value: '3', label: 'Mandi Sync Frequency/day', description: 'Number of times mandi prices are synced per day', type: 'number', updatedAt: new Date().toISOString(), updatedBy: 'System' },
];

const SEED_ACTIVITY: ActivityFeedItem[] = [
  { id: 'A1', icon: '📦', text: 'New order: Vikas Ent. → Raju Farms · Wheat 500kg', time: '2 min ago' },
  { id: 'A2', icon: '✅', text: 'Farmer verified: Harish Kumar (Lucknow, UP)', time: '15 min ago' },
  { id: 'A3', icon: '⚖️', text: 'Dispute resolved: Order #ORD-2039 → Refund issued', time: '1 hr ago' },
  { id: 'A4', icon: '🏢', text: 'New wholesaler registered: Metro Foods Pvt Ltd', time: '2 hrs ago' },
  { id: 'A5', icon: '💰', text: 'Payment settled: ₹13,440 → Raju Patel (Wheat)', time: '3 hrs ago' },
  { id: 'A6', icon: '📋', text: 'New listing: Organic Tomatoes by Suresh Kumar', time: '4 hrs ago' },
];

const SEED_SYNC_HISTORY = [
  { date: new Date(Date.now() - 7200000).toISOString(), source: 'data.gov.in', count: 28 },
  { date: new Date(Date.now() - 25200000).toISOString(), source: 'eNAM (fallback)', count: 24 },
  { date: new Date(Date.now() - 43200000).toISOString(), source: 'Agmarknet (fallback)', count: 31 },
];

// ── Store Interface ───────────────────────────────────────────────────────────

interface AdminStore {
  kycApplications: KYCApplication[];
  disputes: Dispute[];
  users: UserSummary[];
  farmers: FarmerProfile[];
  mandiPrices: MandiPrice[];
  broadcastHistory: BroadcastNotification[];
  platformConfig: PlatformConfig[];
  activityFeed: ActivityFeedItem[];
  mandiSyncHistory: { date: string; source: string; count: number }[];

  approveKyc: (id: string, creditLimit: number) => void;
  rejectKyc: (id: string) => void;
  resolveDispute: (id: string, resolution: Dispute['status'], note?: string) => void;
  suspendUser: (id: string, reason?: string) => void;
  activateUser: (id: string) => void;
  verifyFarmer: (userId: string) => void;
  updateFarmerScore: (userId: string, field: string, value: number) => void;
  updateMandiPrice: (id: number, updates: Partial<MandiPrice>) => void;
  addMandiPrice: (price: MandiPrice) => void;
  syncMandiPrices: () => void;
  sendBroadcast: (notification: BroadcastNotification) => void;
  updateConfig: (key: string, value: string) => void;
  addActivity: (item: ActivityFeedItem) => void;

  getPendingKyc: () => KYCApplication[];
  getOpenDisputes: () => Dispute[];
  getResolvedDisputes: () => Dispute[];
}

// ── Zustand Store ─────────────────────────────────────────────────────────────

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      kycApplications: SEED_KYC,
      disputes: SEED_DISPUTES,
      users: SEED_USERS,
      farmers: SEED_FARMERS,
      mandiPrices: SEED_MANDI,
      broadcastHistory: SEED_BROADCASTS,
      platformConfig: SEED_CONFIG,
      activityFeed: SEED_ACTIVITY,
      mandiSyncHistory: SEED_SYNC_HISTORY,

      approveKyc: (id, creditLimit) => {
        const name = get().kycApplications.find(k => k.id === id)?.businessName;
        set(state => ({
          kycApplications: state.kycApplications.map(k => k.id === id ? { ...k, status: 'APPROVED', creditLimit } : k),
          activityFeed: [{ id: `A-${Date.now()}`, icon: '✅', text: `KYC approved: ${name}`, time: 'Just now' }, ...state.activityFeed].slice(0, 20),
        }));
      },

      rejectKyc: (id) => {
        const name = get().kycApplications.find(k => k.id === id)?.businessName;
        set(state => ({
          kycApplications: state.kycApplications.map(k => k.id === id ? { ...k, status: 'REJECTED' } : k),
          activityFeed: [{ id: `A-${Date.now()}`, icon: '❌', text: `KYC rejected: ${name}`, time: 'Just now' }, ...state.activityFeed].slice(0, 20),
        }));
      },

      resolveDispute: (id, resolution, note) => {
        const orderId = get().disputes.find(d => d.id === id)?.orderId;
        set(state => ({
          disputes: state.disputes.map(d => d.id === id ? { ...d, status: resolution, resolvedAt: new Date().toISOString(), resolutionNote: note } : d),
          activityFeed: [{ id: `A-${Date.now()}`, icon: '⚖️', text: `Dispute resolved: ${orderId}`, time: 'Just now' }, ...state.activityFeed].slice(0, 20),
        }));
      },

      suspendUser: (id, reason) => set(state => ({
        users: state.users.map(u => u.id === id ? { ...u, status: 'SUSPENDED', suspendReason: reason } : u),
      })),

      activateUser: (id) => set(state => ({
        users: state.users.map(u => u.id === id ? { ...u, status: 'ACTIVE', suspendReason: undefined } : u),
      })),

      verifyFarmer: (userId) => {
        const name = get().farmers.find(f => f.userId === userId)?.name;
        set(state => ({
          farmers: state.farmers.map(f => f.userId === userId ? { ...f, isVerified: true } : f),
          activityFeed: [{ id: `A-${Date.now()}`, icon: '✅', text: `Farmer verified: ${name}`, time: 'Just now' }, ...state.activityFeed].slice(0, 20),
        }));
      },

      updateFarmerScore: (userId, field, value) => {
        set(state => ({
          farmers: state.farmers.map(f => {
            if (f.userId !== userId) return f;
            const updated = { ...f, [field]: value };
            updated.scoreTotal = Math.round((updated.scoreQuality + updated.scoreAccuracy + updated.scorePunctuality + updated.scoreVolume) / 4);
            return updated;
          }),
        }));
      },

      updateMandiPrice: (id, updates) => set(state => ({
        mandiPrices: state.mandiPrices.map(m => m.id === id ? { ...m, ...updates, lastUpdated: new Date().toISOString(), source: 'manual' } : m),
      })),

      addMandiPrice: (price) => set(state => ({ mandiPrices: [...state.mandiPrices, price] })),

      syncMandiPrices: () => {
        set(state => {
          const updated = state.mandiPrices.map(p => ({
            ...p,
            minPrice: p.minPrice + Math.floor(Math.random() * 50 - 25),
            maxPrice: p.maxPrice + Math.floor(Math.random() * 50 - 25),
            modalPrice: p.modalPrice + Math.floor(Math.random() * 30 - 15),
            lastUpdated: new Date().toISOString(), source: 'data.gov.in',
          }));
          return {
            mandiPrices: updated,
            mandiSyncHistory: [{ date: new Date().toISOString(), source: 'data.gov.in', count: updated.length }, ...state.mandiSyncHistory].slice(0, 7),
            activityFeed: [{ id: `A-${Date.now()}`, icon: '📈', text: `Mandi prices synced: ${updated.length} prices updated`, time: 'Just now' }, ...state.activityFeed].slice(0, 20),
          };
        });
      },

      sendBroadcast: (notification) => set(state => ({
        broadcastHistory: [notification, ...state.broadcastHistory],
        activityFeed: [{ id: `A-${Date.now()}`, icon: '🔔', text: `Broadcast sent: "${notification.titleEn}" to ${notification.audience}`, time: 'Just now' }, ...state.activityFeed].slice(0, 20),
      })),

      updateConfig: (key, value) => set(state => ({
        platformConfig: state.platformConfig.map(c => c.key === key ? { ...c, value, updatedAt: new Date().toISOString(), updatedBy: 'Admin' } : c),
      })),

      addActivity: (item) => set(state => ({
        activityFeed: [item, ...state.activityFeed].slice(0, 20),
      })),

      getPendingKyc: () => get().kycApplications.filter(k => k.status === 'PENDING'),
      getOpenDisputes: () => get().disputes.filter(d => d.status === 'OPEN'),
      getResolvedDisputes: () => get().disputes.filter(d => d.status !== 'OPEN'),
    }),
    { name: 'agriconnect-admin' }
  )
);
