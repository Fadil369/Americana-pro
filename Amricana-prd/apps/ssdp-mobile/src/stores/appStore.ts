// BRAINSAIT: Global application state management using Zustand
// BILINGUAL: Manages language, offline data, and app state

import { create } from 'zustand';

interface Outlet {
  id: string;
  name_ar: string;
  name_en: string;
  latitude: number;
  longitude: number;
  address: string;
  district: string;
  city: string;
  status: string;
  credit_balance: number;
}

interface Order {
  id: string;
  order_number: string;
  outlet_id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface AppState {
  // Network status
  isOnline: boolean;
  setIsOnline: (isOnline: boolean) => void;

  // Cached data
  outlets: Outlet[];
  orders: Order[];
  setOutlets: (outlets: Outlet[]) => void;
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;

  // App settings
  language: 'ar' | 'en';
  setLanguage: (language: 'ar' | 'en') => void;

  // Sync status
  syncPending: number;
  setSyncPending: (count: number) => void;
  lastSyncTime: number | null;
  setLastSyncTime: (time: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Network status
  isOnline: true,
  setIsOnline: (isOnline) => set({ isOnline }),

  // Cached data
  outlets: [],
  orders: [],
  setOutlets: (outlets) => set({ outlets }),
  setOrders: (orders) => set({ orders }),
  addOrder: (order) => set((state) => ({ orders: [...state.orders, order] })),

  // App settings
  language: 'ar',
  setLanguage: (language) => set({ language }),

  // Sync status
  syncPending: 0,
  setSyncPending: (count) => set({ syncPending: count }),
  lastSyncTime: null,
  setLastSyncTime: (time) => set({ lastSyncTime: time }),
}));
