import {
  AuthResponse, User, Product, ProductListResponse,
  Category, Brand, Cart, WishlistItem, Order, Review,
  Coupon, DashboardStats, Address
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

// Helper for Pakistani Rupee formatting
export function formatPKR(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return 'Rs. 0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Rs. 0';
  return `Rs. ${Math.round(num).toLocaleString('en-PK')}`;
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sess = localStorage.getItem('mobixora_session_id');
  if (!sess) {
    sess = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('mobixora_session_id', sess);
  }
  return sess;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('mobixora_token');
}

export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mobixora_token', token);
  }
}

export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mobixora_token');
  }
}

import { getMockFallback } from './mockData';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const isCloudWithoutBackend = typeof window !== 'undefined' && 
    window.location.hostname !== 'localhost' && 
    window.location.hostname !== '127.0.0.1' && 
    !process.env.NEXT_PUBLIC_API_URL;

  // On public domain like Vercel without remote backend, avoid triggering Android local network warning & Failed to fetch
  if (isCloudWithoutBackend) {
    const fallback = getMockFallback<T>(endpoint, options);
    if (fallback !== undefined) {
      return fallback;
    }
  }

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers = new Headers(options.headers || {});

  headers.set('Content-Type', 'application/json');

  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const sessId = getSessionId();
  if (sessId) {
    headers.set('X-Session-ID', sessId);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorDetail = 'Something went wrong';
      try {
        const errorJson = await response.json();
        errorDetail = errorJson.detail || errorJson.message || JSON.stringify(errorJson);
      } catch {
        errorDetail = response.statusText;
      }
      throw new Error(errorDetail);
    }

    return response.json();
  } catch (error) {
    // When backend is offline or on standalone Vercel preview, gracefully fallback
    const fallback = getMockFallback<T>(endpoint, options);
    if (fallback !== undefined) {
      return fallback;
    }
    throw error;
  }
}

export const api = {
  // Auth
  register: (data: { name: string; email: string; phone?: string; password: string }) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email_or_phone: string; password: string }) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  getMe: () => request<User>('/auth/me'),

  updateProfile: (data: { name?: string; phone?: string; password?: string }) =>
    request<User>('/auth/me', { method: 'PUT', body: JSON.stringify(data) }),

  getAddresses: () => request<Address[]>('/auth/addresses'),

  addAddress: (data: Omit<Address, 'id' | 'user_id' | 'created_at'>) =>
    request<Address>('/auth/addresses', { method: 'POST', body: JSON.stringify(data) }),

  deleteAddress: (id: number) =>
    request<{ message: string }>(`/auth/addresses/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => request<Category[]>('/categories'),
  getCategory: (idOrSlug: string) => request<Category>(`/categories/${idOrSlug}`),
  createCategory: (data: Partial<Category>) =>
    request<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: number, data: Partial<Category>) =>
    request<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id: number) =>
    request<{ message: string }>(`/categories/${id}`, { method: 'DELETE' }),

  // Brands
  getBrands: () => request<Brand[]>('/brands'),
  getBrand: (idOrSlug: string) => request<Brand>(`/brands/${idOrSlug}`),
  createBrand: (data: Partial<Brand>) =>
    request<Brand>('/brands', { method: 'POST', body: JSON.stringify(data) }),
  updateBrand: (id: number, data: Partial<Brand>) =>
    request<Brand>(`/brands/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBrand: (id: number) =>
    request<{ message: string }>(`/brands/${id}`, { method: 'DELETE' }),

  // Products
  getProducts: (params?: Record<string, any>) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          query.append(k, String(v));
        }
      });
    }
    const qStr = query.toString();
    return request<ProductListResponse>(`/products${qStr ? `?${qStr}` : ''}`);
  },

  getProduct: (slugOrId: string) => request<Product>(`/products/${slugOrId}`),

  createProduct: (data: any) =>
    request<Product>('/products', { method: 'POST', body: JSON.stringify(data) }),

  updateProduct: (id: number, data: any) =>
    request<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteProduct: (id: number) =>
    request<{ message: string }>(`/products/${id}`, { method: 'DELETE' }),

  // Cart
  getCart: () => request<Cart>('/cart'),
  addToCart: (productId: number, variantId?: number | null, quantity: number = 1) =>
    request<Cart>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, variant_id: variantId, quantity }),
    }),
  updateCartItem: (itemId: number, quantity: number) =>
    request<Cart>(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),
  removeCartItem: (itemId: number) =>
    request<Cart>(`/cart/items/${itemId}`, { method: 'DELETE' }),
  clearCart: () => request<Cart>('/cart/clear', { method: 'DELETE' }),

  // Wishlist
  getWishlist: () => request<WishlistItem[]>('/wishlist'),
  toggleWishlist: (productId: number) =>
    request<{ action: string; in_wishlist: boolean; message: string }>('/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    }),
  removeFromWishlist: (productId: number) =>
    request<{ message: string }>(`/wishlist/${productId}`, { method: 'DELETE' }),

  // Coupons
  validateCoupon: (code: string, subtotal: number) =>
    request<{
      valid: boolean;
      code: string;
      discount_type: string;
      discount_value: number;
      discount_amount: number;
      message: string;
    }>('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    }),
  getCoupons: () => request<Coupon[]>('/coupons'),
  createCoupon: (data: Partial<Coupon>) =>
    request<Coupon>('/coupons', { method: 'POST', body: JSON.stringify(data) }),
  deleteCoupon: (id: number) =>
    request<{ message: string }>(`/coupons/${id}`, { method: 'DELETE' }),

  // Orders
  createOrder: (data: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: string;
    shipping_city: string;
    shipping_province: string;
    shipping_postal_code?: string;
    payment_method: string;
    coupon_code?: string;
    notes?: string;
    items?: { product_id: number; quantity: number; variant_id?: number | null }[];
  }) => request<Order>('/orders', { method: 'POST', body: JSON.stringify(data) }),

  getUserOrders: () => request<Order[]>('/orders'),
  getOrder: (orderNumberOrId: string) => request<Order>(`/orders/${orderNumberOrId}`),
  cancelOrder: (orderId: number) =>
    request<Order>(`/orders/${orderId}/cancel`, { method: 'PUT' }),

  // Reviews
  getProductReviews: (productId: number) =>
    request<Review[]>(`/reviews/product/${productId}`),
  getRecentReviews: (limit: number = 6) =>
    request<Review[]>(`/reviews/recent?limit=${limit}`),
  submitReview: (data: { product_id: number; rating: number; comment: string }) =>
    request<Review>('/reviews', { method: 'POST', body: JSON.stringify(data) }),

  // Admin
  getDashboardStats: () => request<DashboardStats>('/admin/dashboard'),
  getAdminOrders: (status?: string, q?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status_filter', status);
    if (q) params.append('q', q);
    const qs = params.toString();
    return request<Order[]>(`/admin/orders${qs ? `?${qs}` : ''}`);
  },
  updateOrderStatus: (orderId: number, data: { order_status?: string; payment_status?: string }) =>
    request<Order>(`/admin/orders/${orderId}/status`, { method: 'PUT', body: JSON.stringify(data) }),
  getAdminCustomers: (q?: string) => {
    const qs = q ? `?q=${encodeURIComponent(q)}` : '';
    return request<any[]>(`/admin/customers${qs}`);
  },
  toggleCustomerStatus: (customerId: number) =>
    request<{ message: string; is_active: boolean }>(`/admin/customers/${customerId}/toggle-status`, {
      method: 'PUT',
    }),
  getInventory: (lowStockOnly: boolean = false) =>
    request<any[]>(`/admin/inventory?low_stock_only=${lowStockOnly}`),
  updateInventoryStock: (productId: number, stock: number) =>
    request<{ message: string; product_id: number; new_stock: number }>(
      `/admin/inventory/${productId}/stock?stock=${stock}`,
      { method: 'PUT' }
    ),
};
