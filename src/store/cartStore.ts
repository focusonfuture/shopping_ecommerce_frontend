import { create } from 'zustand';
import { cartApi } from '@/lib/api';

interface CartItem {
  id: number;
  product: any;
  variant?: any;
  quantity: number;
  unit_price: string;
  total_price: string;
}

interface Cart {
  id: string;
  items: CartItem[];
  coupon?: any;
  subtotal: string;
  discount_amount: string;
  total: string;
  item_count: number;
}

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  isOpen: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number, variantId?: string) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,
  isOpen: false,

  fetchCart: async () => {
    try {
      const { data } = await cartApi.get();
      set({ cart: data });
    } catch {}
  },

  addItem: async (productId, quantity = 1, variantId?) => {
    set({ isLoading: true });
    try {
      const { data } = await cartApi.addItem({
        product_id: productId,
        quantity,
        ...(variantId && { variant_id: variantId }),
      });
      set({ cart: data, isOpen: true });
    } finally {
      set({ isLoading: false });
    }
  },

  updateItem: async (itemId, quantity) => {
    set({ isLoading: true });
    try {
      const { data } = await cartApi.updateItem(itemId, quantity);
      set({ cart: data });
    } finally {
      set({ isLoading: false });
    }
  },

  removeItem: async (itemId) => {
    set({ isLoading: true });
    try {
      const { data } = await cartApi.removeItem(itemId);
      set({ cart: data });
    } finally {
      set({ isLoading: false });
    }
  },

  clearCart: async () => {
    await cartApi.clear();
    set({ cart: null });
  },

  applyCoupon: async (code) => {
    const { data } = await cartApi.applyCoupon(code);
    set({ cart: data });
  },

  removeCoupon: async () => {
    const { data } = await cartApi.removeCoupon();
    set({ cart: data });
  },

  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
}));
