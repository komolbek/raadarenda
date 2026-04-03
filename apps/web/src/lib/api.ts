import axios from 'axios';
import type {
  ApiResponse,
  PaginatedResponse,
  IUser,
  ICategory,
  IProduct,
  IDayAvailability,
  IOrder,
  IAddress,
  ICard,
  IReview,
  IReviewStats,
  IBusinessSettings,
  IDeliveryZone,
  IReturnRequest,
  IRentalExtension,
} from '@4event/types';

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach Bearer token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const token = parsed?.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // ignore parse errors
      }
    }
  }
  return config;
});

// Response interceptor: redirect on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Clear auth state
      localStorage.removeItem('auth-storage');
      // Redirect to auth if not already there
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  },
);

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------

export const authApi = {
  sendOtp(phone_number: string) {
    return api.post<ApiResponse>('/auth/send-otp', { phone_number });
  },

  verifyOtp(phone_number: string, code: string, device_id: string) {
    return api.post<ApiResponse<{ token: string; user: IUser }>>('/auth/verify-otp', {
      phone_number,
      code,
      device_id,
    });
  },

  logout() {
    return api.post<ApiResponse>('/auth/logout');
  },
};

// ---------------------------------------------------------------------------
// Categories API
// ---------------------------------------------------------------------------

export const categoriesApi = {
  getAll() {
    return api.get<ApiResponse<ICategory[]>>('/categories');
  },
};

// ---------------------------------------------------------------------------
// Products API
// ---------------------------------------------------------------------------

export const productsApi = {
  getAll(params?: {
    page?: number;
    limit?: number;
    category_id?: string;
    search?: string;
    sort?: 'newest' | 'popular' | 'price_asc' | 'price_desc';
  }) {
    return api.get<ApiResponse<PaginatedResponse<IProduct>>>('/products', { params });
  },

  getById(id: string) {
    return api.get<ApiResponse<IProduct>>(`/products/${id}`);
  },

  checkAvailability(
    id: string,
    params: { start_date: string; end_date: string; quantity?: number },
  ) {
    return api.get<ApiResponse<IDayAvailability[]>>(`/products/${id}/availability`, { params });
  },

  getReviews(id: string, params?: { page?: number; limit?: number }) {
    return api.get<
      ApiResponse<{ reviews: PaginatedResponse<IReview>; stats: IReviewStats }>
    >(`/products/${id}/reviews`, { params });
  },
};

// ---------------------------------------------------------------------------
// Reviews API
// ---------------------------------------------------------------------------

export const reviewsApi = {
  create(data: { product_id: string; rating: number; comment?: string; photos?: string[] }) {
    return api.post<ApiResponse<IReview>>('/reviews', data);
  },

  update(id: string, data: { rating?: number; comment?: string; photos?: string[] }) {
    return api.put<ApiResponse<IReview>>(`/reviews/${id}`, data);
  },

  delete(id: string) {
    return api.delete<ApiResponse>(`/reviews/${id}`);
  },
};

// ---------------------------------------------------------------------------
// User API
// ---------------------------------------------------------------------------

export const userApi = {
  getProfile() {
    return api.get<ApiResponse<IUser>>('/user/profile');
  },

  updateProfile(name: string) {
    return api.post<ApiResponse<IUser>>('/user/profile', { name });
  },

  // Addresses
  getAddresses() {
    return api.get<ApiResponse<IAddress[]>>('/user/addresses');
  },

  createAddress(data: {
    title: string;
    full_address: string;
    city: string;
    district?: string;
    street?: string;
    building?: string;
    apartment?: string;
    entrance?: string;
    floor?: string;
    latitude?: number;
    longitude?: number;
    is_default?: boolean;
  }) {
    return api.post<ApiResponse<IAddress>>('/user/addresses', data);
  },

  deleteAddress(addressId: string) {
    return api.delete<ApiResponse>(`/user/addresses/${addressId}`);
  },

  setDefaultAddress(addressId: string) {
    return api.post<ApiResponse>(`/user/addresses/${addressId}/default`);
  },

  // Cards
  getCards() {
    return api.get<ApiResponse<ICard[]>>('/user/cards');
  },

  addCard(data: {
    card_number: string;
    card_holder: string;
    expiry_month: number;
    expiry_year: number;
  }) {
    return api.post<ApiResponse<ICard>>('/user/cards', data);
  },

  deleteCard(cardId: string) {
    return api.delete<ApiResponse>(`/user/cards/${cardId}`);
  },

  setDefaultCard(cardId: string) {
    return api.post<ApiResponse>(`/user/cards/${cardId}/default`);
  },

  // Favorites
  getFavorites() {
    return api.get<ApiResponse<IProduct[]>>('/user/favorites');
  },

  addFavorite(product_id: string) {
    return api.post<ApiResponse>('/user/favorites', { product_id });
  },

  removeFavorite(productId: string) {
    return api.delete<ApiResponse>(`/user/favorites/${productId}`);
  },
};

// ---------------------------------------------------------------------------
// Orders API
// ---------------------------------------------------------------------------

export const ordersApi = {
  create(data: {
    items: { product_id: string; quantity: number }[];
    rental_start_date: string;
    rental_end_date: string;
    delivery_type: 'DELIVERY' | 'SELF_PICKUP';
    delivery_address_id?: string;
    payment_method: string;
    notes?: string;
  }) {
    return api.post<ApiResponse<IOrder>>('/orders', data);
  },

  getMyOrders(params?: { page?: number; limit?: number; status?: string }) {
    return api.get<ApiResponse<PaginatedResponse<IOrder>>>('/orders/my-orders', { params });
  },

  getById(id: string) {
    return api.get<ApiResponse<IOrder>>(`/orders/${id}`);
  },

  cancel(id: string) {
    return api.post<ApiResponse>(`/orders/${id}/cancel`);
  },
};

// ---------------------------------------------------------------------------
// Returns API
// ---------------------------------------------------------------------------

export const returnsApi = {
  create(data: { order_id: string; reason?: string; photos?: string[] }) {
    return api.post<ApiResponse<IReturnRequest>>('/returns', data);
  },

  getMyReturns(params?: { page?: number; limit?: number }) {
    return api.get<ApiResponse<PaginatedResponse<IReturnRequest>>>('/returns/my-returns', {
      params,
    });
  },

  getById(id: string) {
    return api.get<ApiResponse<IReturnRequest>>(`/returns/${id}`);
  },
};

// ---------------------------------------------------------------------------
// Extensions API
// ---------------------------------------------------------------------------

export const extensionsApi = {
  create(data: { order_id: string; additional_days: number; notes?: string }) {
    return api.post<ApiResponse<IRentalExtension>>('/extensions', data);
  },

  getMyExtensions(params?: { page?: number; limit?: number }) {
    return api.get<ApiResponse<PaginatedResponse<IRentalExtension>>>('/extensions/my-extensions', {
      params,
    });
  },
};

// ---------------------------------------------------------------------------
// Business Settings API
// ---------------------------------------------------------------------------

export const settingsApi = {
  getBusinessInfo() {
    return api.get<
      ApiResponse<{ settings: IBusinessSettings; deliveryZones: IDeliveryZone[] }>
    >('/business/info');
  },
};

export default api;
