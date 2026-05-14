'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';

export interface StandingOrder {
  id: string; wholesalerId: string; farmerId: string; farmerName: string;
  cropName: string; quantityKg: number; pricePerKg: number;
  frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  nextExecution: string; createdAt: string;
}

interface SOState { orders: StandingOrder[]; }

type SOAction =
  | { type: 'ADD'; payload: StandingOrder }
  | { type: 'UPDATE_STATUS'; payload: { id: string; status: StandingOrder['status'] } }
  | { type: 'DELETE'; payload: string }
  | { type: 'HYDRATE'; payload: SOState };

function soReducer(state: SOState, action: SOAction): SOState {
  switch (action.type) {
    case 'ADD': return { orders: [action.payload, ...state.orders] };
    case 'UPDATE_STATUS': return { orders: state.orders.map((o) => o.id === action.payload.id ? { ...o, status: action.payload.status } : o) };
    case 'DELETE': return { orders: state.orders.filter((o) => o.id !== action.payload) };
    case 'HYDRATE': return action.payload;
    default: return state;
  }
}

const getNextExecution = (frequency: string) => {
  const date = new Date();
  if (frequency === 'WEEKLY') date.setDate(date.getDate() + 7);
  else if (frequency === 'BIWEEKLY') date.setDate(date.getDate() + 14);
  else if (frequency === 'MONTHLY') date.setMonth(date.getMonth() + 1);
  return date.toISOString();
};

const SEED: StandingOrder[] = [
  { id:'SO-1001',wholesalerId:'demo-wholesaler-001',farmerId:'demo-farmer-001',farmerName:'Raju Patel',cropName:'Wheat (Lokwan)',quantityKg:500,pricePerKg:28,frequency:'WEEKLY',status:'ACTIVE',nextExecution:getNextExecution('WEEKLY'),createdAt:new Date().toISOString() },
  { id:'SO-1002',wholesalerId:'demo-wholesaler-001',farmerId:'demo-farmer-004',farmerName:'Venkat Rao',cropName:'Green Chili',quantityKg:50,pricePerKg:45,frequency:'BIWEEKLY',status:'PAUSED',nextExecution:getNextExecution('BIWEEKLY'),createdAt:new Date().toISOString() },
];

let idCounter = 1000;

interface SOCtxVal extends SOState {
  addOrder: (order: Omit<StandingOrder, 'id' | 'createdAt' | 'status'>) => string;
  updateStatus: (id: string, status: StandingOrder['status']) => void;
  deleteOrder: (id: string) => void;
  getByWholesaler: (wholesalerId: string) => StandingOrder[];
}

const SOContext = createContext<SOCtxVal | null>(null);
const STORAGE_KEY = 'agriconnect-standing-orders';

export function StandingOrderProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(soReducer, { orders: SEED });
  const hydrated = useRef(false);
  const ref = useRef(state); ref.current = state;

  useEffect(() => {
    try { const r = localStorage.getItem(STORAGE_KEY); if (r) { const p = JSON.parse(r); if (p?.state?.orders) dispatch({ type: 'HYDRATE', payload: { orders: p.state.orders } }); } } catch {}
    hydrated.current = true;
  }, []);

  useEffect(() => { if (!hydrated.current) return; try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ state })); } catch {} }, [state]);

  const addOrder = useCallback((order: Omit<StandingOrder, 'id' | 'createdAt' | 'status'>) => {
    const id = `SO-${String(++idCounter)}`;
    dispatch({ type: 'ADD', payload: { ...order, id, status: 'ACTIVE', createdAt: new Date().toISOString() } as StandingOrder });
    return id;
  }, []);

  const updateStatus = useCallback((id: string, status: StandingOrder['status']) => dispatch({ type: 'UPDATE_STATUS', payload: { id, status } }), []);
  const deleteOrder = useCallback((id: string) => dispatch({ type: 'DELETE', payload: id }), []);
  const getByWholesaler = useCallback((wholesalerId: string) => ref.current.orders.filter((o) => o.wholesalerId === wholesalerId), []);

  return React.createElement(SOContext.Provider, { value: { ...state, addOrder, updateStatus, deleteOrder, getByWholesaler } }, children);
}

export function useStandingOrderStore(): SOCtxVal {
  const ctx = useContext(SOContext);
  if (!ctx) throw new Error('useStandingOrderStore must be used within <StandingOrderProvider>');
  return ctx;
}
