import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CurrencyState {
  currency: string;
  rates: Record<string, number>;
  setCurrency: (currency: string) => void;
  setRates: (rates: Record<string, number>) => void;
  convert: (amount: number, from?: string) => number;
  format: (amount: number, from?: string) => string;
}

const SYMBOLS: Record<string, string> = {
  INR: '₹', USD: '$', EUR: '€',
};

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: 'INR',
      rates: {},

      setCurrency: (currency) => {
        set({ currency });
        localStorage.setItem('preferred_currency', currency);
      },

      setRates: (rates) => set({ rates }),

      convert: (amount, from = 'INR') => {
        const { currency, rates } = get();
        if (from === currency) return amount;
        const key = `${from}_${currency}`;
        const rate = rates[key];
        if (rate) return amount * rate;
        return amount;
      },

      format: (amount, from = 'INR') => {
        const { currency, convert } = get();
        const converted = convert(amount, from);
        const symbol = SYMBOLS[currency] || currency;
        return `${symbol}${converted.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
      },
    }),
    { name: 'currency-storage' }
  )
);

interface UIState {
  sidebarOpen: boolean;
  searchOpen: boolean;
  mobileMenuOpen: boolean;
  toggleSidebar: () => void;
  toggleSearch: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  searchOpen: false,
  mobileMenuOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),
  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
}));
