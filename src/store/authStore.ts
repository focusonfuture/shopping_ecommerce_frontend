import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, setTokens, clearTokens } from '@/lib/api';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone?: string;
  avatar?: string;
  role: 'customer' | 'admin' | 'staff';
  is_email_verified: boolean;
  preferred_language: string;
  preferred_currency: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.login({ email, password });
          setTokens(data.tokens.access, data.tokens.refresh);
          set({ user: data.user, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (formData) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.register(formData);
          setTokens(data.tokens.access, data.tokens.refresh);
          set({ user: data.user, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          const refresh = localStorage.getItem('refresh_token');
          if (refresh) await authApi.logout(refresh);
        } catch {}
        clearTokens();
        set({ user: null, isAuthenticated: false });
      },

      fetchProfile: async () => {
        try {
          const { data } = await authApi.getProfile();
          set({ user: data, isAuthenticated: true });
        } catch {
          clearTokens();
          set({ user: null, isAuthenticated: false });
        }
      },

      updateProfile: async (formData) => {
        const { data } = await authApi.updateProfile(formData);
        set({ user: data });
      },

      googleLogin: async (token) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.googleAuth(token);
          setTokens(data.tokens.access, data.tokens.refresh);
          set({ user: data.user, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
