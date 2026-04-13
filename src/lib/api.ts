import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request interceptor - attach JWT
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token') || (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Currency header
  const currency = localStorage.getItem('preferred_currency') || 'INR';
  config.headers['X-Currency'] = currency;
  return config;
});

// Response interceptor - handle 401, refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = Cookies.get('refresh_token') || localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh: refreshToken });
          const newAccess = data.access;
          Cookies.set('access_token', newAccess, { expires: 1 });
          localStorage.setItem('access_token', newAccess);
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
          }
          return api(originalRequest);
        } catch {
          // Refresh failed - clear tokens
          clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/en/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export function setTokens(access: string, refresh: string) {
  Cookies.set('access_token', access, { expires: 1 });
  Cookies.set('refresh_token', refresh, { expires: 30 });
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
}

export function clearTokens() {
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

// API helpers
export const authApi = {
  register: (data: any) => api.post('/auth/register/', data),
  login: (data: any) => api.post('/auth/login/', data),
  logout: (refresh: string) => api.post('/auth/logout/', { refresh }),
  googleAuth: (token: string) => api.post('/auth/google/', { token }),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data: any) => api.patch('/auth/profile/', data),
  changePassword: (data: any) => api.post('/auth/change-password/', data),
  requestPasswordReset: (email: string) => api.post('/auth/password-reset/', { email }),
  confirmPasswordReset: (data: any) => api.post('/auth/password-reset/confirm/', data),
  verifyEmail: (token: string) => api.post('/auth/verify-email/', { token }),
  getAddresses: () => api.get('/auth/addresses/'),
  createAddress: (data: any) => api.post('/auth/addresses/', data),
  updateAddress: (id: number, data: any) => api.patch(`/auth/addresses/${id}/`, data),
  deleteAddress: (id: number) => api.delete(`/auth/addresses/${id}/`),
};

export const productsApi = {
  list: (params?: any) => api.get('/products/', { params }),
  detail: (slug: string) => api.get(`/products/${slug}/`),
  featured: () => api.get('/products/featured/'),
  categories: () => api.get('/products/categories/'),
  category: (slug: string) => api.get(`/products/categories/${slug}/`),
  reviews: (slug: string, params?: any) => api.get(`/products/${slug}/reviews/`, { params }),
  createReview: (slug: string, data: any) => api.post(`/products/${slug}/reviews/`, data),
  recommended: (slug: string) => api.get(`/products/${slug}/recommended/`),
  wishlist: () => api.get('/products/wishlist/'),
  toggleWishlist: (productId: string) => api.post('/products/wishlist/', { product_id: productId }),
  recentlyViewed: () => api.get('/products/recently-viewed/'),
};

export const cartApi = {
  get: () => api.get('/cart/'),
  addItem: (data: any) => api.post('/cart/items/', data),
  updateItem: (itemId: number, quantity: number) => api.patch(`/cart/items/${itemId}/`, { quantity }),
  removeItem: (itemId: number) => api.delete(`/cart/items/${itemId}/`),
  clear: () => api.delete('/cart/'),
  applyCoupon: (code: string) => api.post('/cart/coupon/', { code }),
  removeCoupon: () => api.delete('/cart/coupon/'),
  mergeCart: (sessionKey: string) => api.post('/cart/merge/', { session_key: sessionKey }),
};

export const ordersApi = {
  checkout: (data: any) => api.post('/orders/checkout/', data),
  list: () => api.get('/orders/'),
  detail: (id: string) => api.get(`/orders/${id}/`),
  cancel: (id: string) => api.post(`/orders/${id}/cancel/`),
  requestRefund: (id: string, data: any) => api.post(`/orders/${id}/refund/`, data),
  createStripeIntent: (orderId: string) => api.post('/orders/stripe/intent/', { order_id: orderId }),
  createRazorpayOrder: (orderId: string) => api.post('/orders/razorpay/create/', { order_id: orderId }),
  verifyRazorpay: (data: any) => api.post('/orders/razorpay/verify/', data),
};

export const financeApi = {
  dashboard: () => api.get('/finance/dashboard/'),
  revenueChart: (params?: any) => api.get('/finance/revenue-chart/', { params }),
  profitLoss: (params?: any) => api.get('/finance/profit-loss/', { params }),
  topProducts: (params?: any) => api.get('/finance/top-products/', { params }),
  currencyRates: () => api.get('/finance/currency-rates/'),
  convert: (data: any) => api.post('/finance/convert/', data),
  updateRate: (id: number, rate: number) => api.patch(`/finance/currency-rates/${id}/`, { rate }),
};

export const cmsApi = {
  homepageSections: () => api.get('/cms/homepage-sections/'),
  pages: () => api.get('/cms/pages/'),
  page: (slug: string) => api.get(`/cms/pages/${slug}/`),
  banners: (position?: string) => api.get('/cms/banners/', { params: { position } }),
  settings: () => api.get('/cms/settings/'),
  updateSettings: (data: any) => api.post('/cms/settings/', data),
};

export const notificationsApi = {
  list: () => api.get('/notifications/'),
  markRead: (id?: number) => id ? api.post(`/notifications/${id}/mark-read/`) : api.post('/notifications/mark-read/'),
};

export const adminApi = {
  users: (params?: any) => api.get('/auth/admin/users/', { params }),
  updateUser: (id: string, data: any) => api.patch(`/auth/admin/users/${id}/`, data),
  products: (params?: any) => api.get('/products/admin/products/', { params }),
  createProduct: (data: any) => api.post('/products/admin/products/', data),
  updateProduct: (id: string, data: any) => api.patch(`/products/admin/products/${id}/`, data),
  deleteProduct: (id: string) => api.delete(`/products/admin/products/${id}/`),
  orders: (params?: any) => api.get('/orders/admin/orders/', { params }),
  updateOrderStatus: (id: string, data: any) => api.post(`/orders/admin/orders/${id}/status/`, data),
  refunds: (params?: any) => api.get('/orders/admin/refunds/', { params }),
  refundAction: (id: number, action: string) => api.post(`/orders/admin/refunds/${id}/action/`, { action }),
  cmsPages: () => api.get('/cms/pages/'),
  createPage: (data: any) => api.post('/cms/pages/', data),
  updatePage: (slug: string, data: any) => api.patch(`/cms/pages/${slug}/`, data),
  homepageSections: () => api.get('/cms/homepage-sections/'),
  updateSection: (id: number, data: any) => api.patch(`/cms/homepage-sections/${id}/`, data),
  banners: () => api.get('/cms/banners/'),
  createBanner: (data: any) => api.post('/cms/banners/', data),
  updateBanner: (id: number, data: any) => api.patch(`/cms/banners/${id}/`, data),
  taxRates: () => api.get('/orders/admin/tax-rates/'),
  createTaxRate: (data: any) => api.post('/orders/admin/tax-rates/', data),
};
