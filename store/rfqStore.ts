'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';

export interface RFQMessage {
  id: string; senderId: string; senderRole: 'FARMER' | 'WHOLESALER' | 'SYSTEM';
  content: string; pricePerKg?: number; quantityKg?: number; createdAt: string;
}

export interface RFQ {
  id: string; listingId: string; farmerId: string; farmerName: string;
  wholesalerId: string; wholesalerName: string; cropName: string;
  initialQuantityKg: number; initialPricePerKg: number;
  currentPricePerKg: number; currentQuantityKg: number;
  status: 'PENDING' | 'ACCEPTED' | 'COUNTERED' | 'REJECTED';
  messages: RFQMessage[]; createdAt: string; updatedAt: string;
}

interface RFQState { rfqs: RFQ[]; }

type RFQAction =
  | { type: 'ADD'; payload: RFQ }
  | { type: 'UPDATE_STATUS'; payload: { id: string; status: RFQ['status'] } }
  | { type: 'ADD_MESSAGE'; payload: { id: string; message: RFQMessage; pricePerKg?: number; quantityKg?: number } }
  | { type: 'HYDRATE'; payload: RFQState };

function rfqReducer(state: RFQState, action: RFQAction): RFQState {
  switch (action.type) {
    case 'ADD': return { rfqs: [action.payload, ...state.rfqs] };
    case 'UPDATE_STATUS': return { rfqs: state.rfqs.map((r) => r.id === action.payload.id ? { ...r, status: action.payload.status, updatedAt: new Date().toISOString() } : r) };
    case 'ADD_MESSAGE': return {
      rfqs: state.rfqs.map((r) => {
        if (r.id !== action.payload.id) return r;
        const updated = { ...r, messages: [...r.messages, action.payload.message], updatedAt: new Date().toISOString() };
        if (action.payload.pricePerKg) updated.currentPricePerKg = action.payload.pricePerKg;
        if (action.payload.quantityKg) updated.currentQuantityKg = action.payload.quantityKg;
        return updated;
      }),
    };
    case 'HYDRATE': return action.payload;
    default: return state;
  }
}

const SEED: RFQ[] = [
  {
    id:'RFQ-1001',listingId:'L001',farmerId:'demo-farmer-001',farmerName:'Raju Patel',wholesalerId:'demo-wholesaler-001',wholesalerName:'Vikas Trading Co.',cropName:'Wheat (Lokwan)',initialQuantityKg:200,initialPricePerKg:27,currentQuantityKg:200,currentPricePerKg:27,status:'PENDING',
    messages:[{ id:'MSG-001',senderId:'demo-wholesaler-001',senderRole:'WHOLESALER',content:'I would like to purchase 200kg of Lokwan Wheat. Can you do ₹27/kg?',pricePerKg:27,quantityKg:200,createdAt:new Date(Date.now()-86400000).toISOString() }],
    createdAt:new Date(Date.now()-86400000).toISOString(),updatedAt:new Date(Date.now()-86400000).toISOString(),
  },
  {
    id:'RFQ-1002',listingId:'L005',farmerId:'demo-farmer-003',farmerName:'Ramesh Patil',wholesalerId:'demo-wholesaler-001',wholesalerName:'Vikas Trading Co.',cropName:'Potato (Agra)',initialQuantityKg:1000,initialPricePerKg:11,currentQuantityKg:1000,currentPricePerKg:11.5,status:'COUNTERED',
    messages:[
      { id:'MSG-002',senderId:'demo-wholesaler-001',senderRole:'WHOLESALER',content:'Need 1000kg. Offering ₹11/kg.',pricePerKg:11,quantityKg:1000,createdAt:new Date(Date.now()-172800000).toISOString() },
      { id:'MSG-003',senderId:'demo-farmer-003',senderRole:'FARMER',content:'₹11 is too low for this grade. I can do ₹11.5/kg.',pricePerKg:11.5,quantityKg:1000,createdAt:new Date(Date.now()-86400000).toISOString() },
    ],
    createdAt:new Date(Date.now()-172800000).toISOString(),updatedAt:new Date(Date.now()-86400000).toISOString(),
  },
];

let idCounter = 2000;
let msgIdCounter = 100;

interface RFQCtxVal extends RFQState {
  addRfq: (rfq: Omit<RFQ, 'id' | 'messages' | 'createdAt' | 'updatedAt' | 'status'>) => string;
  updateRfqStatus: (id: string, status: RFQ['status']) => void;
  addMessage: (id: string, message: Omit<RFQMessage, 'id' | 'createdAt'>) => void;
  getByWholesaler: (wholesalerId: string) => RFQ[];
  getByFarmer: (farmerId: string) => RFQ[];
  getById: (id: string) => RFQ | undefined;
}

const RFQContext = createContext<RFQCtxVal | null>(null);
const STORAGE_KEY = 'agriconnect-rfqs';

export function RFQProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(rfqReducer, { rfqs: SEED });
  const hydrated = useRef(false);
  const ref = useRef(state); ref.current = state;

  useEffect(() => {
    try { const r = localStorage.getItem(STORAGE_KEY); if (r) { const p = JSON.parse(r); if (p?.state?.rfqs) dispatch({ type: 'HYDRATE', payload: { rfqs: p.state.rfqs } }); } } catch {}
    hydrated.current = true;
  }, []);

  useEffect(() => { if (!hydrated.current) return; try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ state })); } catch {} }, [state]);

  const addRfq = useCallback((rfq: Omit<RFQ, 'id' | 'messages' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const id = `RFQ-${String(++idCounter)}`;
    const now = new Date().toISOString();
    dispatch({ type: 'ADD', payload: { ...rfq, id, status: 'PENDING', messages: [], createdAt: now, updatedAt: now } as RFQ });
    return id;
  }, []);

  const updateRfqStatus = useCallback((id: string, status: RFQ['status']) => dispatch({ type: 'UPDATE_STATUS', payload: { id, status } }), []);

  const addMessage = useCallback((id: string, message: Omit<RFQMessage, 'id' | 'createdAt'>) => {
    const msgId = `MSG-${String(++msgIdCounter).padStart(3, '0')}`;
    dispatch({ type: 'ADD_MESSAGE', payload: { id, message: { ...message, id: msgId, createdAt: new Date().toISOString() }, pricePerKg: message.pricePerKg, quantityKg: message.quantityKg } });
  }, []);

  const getByWholesaler = useCallback((wholesalerId: string) => ref.current.rfqs.filter((r) => r.wholesalerId === wholesalerId), []);
  const getByFarmer = useCallback((farmerId: string) => ref.current.rfqs.filter((r) => r.farmerId === farmerId), []);
  const getById = useCallback((id: string) => ref.current.rfqs.find((r) => r.id === id), []);

  return React.createElement(RFQContext.Provider, { value: { ...state, addRfq, updateRfqStatus, addMessage, getByWholesaler, getByFarmer, getById } }, children);
}

export function useRFQStore(): RFQCtxVal {
  const ctx = useContext(RFQContext);
  if (!ctx) throw new Error('useRFQStore must be used within <RFQProvider>');
  return ctx;
}
