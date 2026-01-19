import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import type {
  User,
  Category,
  Product,
  ProductAvailability,
  Address,
  Card,
  Order,
  SendOTPResponse,
  VerifyOTPResponse,
  PaginatedResponse,
  BusinessSettings,
  DeliveryZone,
} from './types';

// For Next.js, we use relative path since API routes are on same domain
const API_BASE_URL = '/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      // Don't redirect automatically - let the auth store and page components handle it
      // This prevents redirect loops when multiple 401s happen simultaneously
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  sendOTP: async (phoneNumber: string): Promise<SendOTPResponse> => {
    const { data } = await api.post('/auth/send-otp', { phone_number: phoneNumber });
    return data;
  },

  verifyOTP: async (phoneNumber: string, code: string, deviceId: string): Promise<VerifyOTPResponse> => {
    const { data } = await api.post('/auth/verify-otp', {
      phone_number: phoneNumber,
      code,
      device_id: deviceId,
    });
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  },
};

// Categories API
export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const { data } = await api.get('/categories');
    // API returns { success: true, data: [...] } with snake_case fields
    const categories = data.data || data.categories || data;
    return Array.isArray(categories) ? categories.map((cat: Record<string, unknown>) => ({
      id: cat.id as string,
      name: cat.name as string,
      icon: (cat.icon_name || cat.icon || null) as string | null,
      image: (cat.image_url || cat.image || null) as string | null,
      displayOrder: (cat.display_order ?? cat.displayOrder ?? 0) as number,
      isActive: (cat.is_active ?? cat.isActive ?? true) as boolean,
      createdAt: (cat.created_at || cat.createdAt || '') as string,
    })) : [];
  },
};

// Products API
export const productsApi = {
  getAll: async (params?: {
    category_id?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<PaginatedResponse<Product>> => {
    const { data } = await api.get('/products', { params });
    // API returns { success, data: [...], pagination: {...} }
    const products = data.data || data.items || [];
    const pagination = data.pagination || {};

    // Map snake_case product fields to camelCase
    const mappedProducts = Array.isArray(products) ? products.map((p: Record<string, unknown>) => ({
      id: p.id as string,
      name: p.name as string,
      categoryId: (p.category_id || p.categoryId) as string,
      photos: (p.photos || []) as string[],
      specifications: p.specifications || {},
      dailyPrice: (p.daily_price ?? p.dailyPrice ?? 0) as number,
      pricingTiers: (p.pricing_tiers || p.pricingTiers || []) as Product['pricingTiers'],
      quantityPricing: (p.quantity_pricing || p.quantityPricing || []) as Product['quantityPricing'],
      totalStock: (p.total_stock ?? p.totalStock ?? 0) as number,
      isActive: (p.is_active ?? p.isActive ?? true) as boolean,
      createdAt: (p.created_at || p.createdAt || '') as string,
    })) : [];

    return {
      items: mappedProducts,
      total: pagination.total_count || pagination.total || mappedProducts.length,
      page: pagination.current_page || pagination.page || 1,
      limit: pagination.limit || 12,
      totalPages: pagination.total_pages || pagination.totalPages || 1,
    };
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await api.get(`/products/${id}`);
    // API returns { success, data: {...} } with snake_case fields
    const p = data.data || data.product || data;
    return {
      id: p.id as string,
      name: p.name as string,
      categoryId: (p.category_id || p.categoryId) as string,
      photos: (p.photos || []) as string[],
      specifications: p.specifications || {},
      dailyPrice: (p.daily_price ?? p.dailyPrice ?? 0) as number,
      pricingTiers: ((p.pricing_tiers || p.pricingTiers || []) as Array<{ days?: number; min_days?: number; minDays?: number; total_price?: number; totalPrice?: number; dailyPrice?: number; daily_price?: number }>).map((tier) => ({
        id: '',
        productId: p.id as string,
        minDays: tier.days || tier.min_days || tier.minDays || 0,
        maxDays: null,
        dailyPrice: tier.total_price || tier.totalPrice || tier.dailyPrice || tier.daily_price || 0,
      })),
      quantityPricing: ((p.quantity_pricing || p.quantityPricing || []) as Array<{ quantity?: number; min_quantity?: number; minQuantity?: number; total_price?: number; totalPrice?: number; pricePerUnit?: number; price_per_unit?: number }>).map((qp) => ({
        id: '',
        productId: p.id as string,
        minQuantity: qp.quantity || qp.min_quantity || qp.minQuantity || 0,
        maxQuantity: null,
        pricePerUnit: qp.total_price || qp.totalPrice || qp.pricePerUnit || qp.price_per_unit || 0,
      })),
      totalStock: (p.total_stock ?? p.totalStock ?? 0) as number,
      isActive: (p.is_active ?? p.isActive ?? true) as boolean,
      createdAt: (p.created_at || p.createdAt || '') as string,
    };
  },

  checkAvailability: async (
    id: string,
    startDate: string,
    endDate: string,
    quantity?: number
  ): Promise<ProductAvailability> => {
    const { data } = await api.get(`/products/${id}/availability`, {
      params: { start_date: startDate, end_date: endDate, quantity },
    });
    return data;
  },
};

// User API
export const userApi = {
  getProfile: async (): Promise<User> => {
    const { data } = await api.get('/user/profile');
    return data.user || data;
  },

  updateProfile: async (name: string): Promise<User> => {
    const { data } = await api.post('/user/profile', { name });
    return data.user || data;
  },

  // Addresses
  getAddresses: async (): Promise<Address[]> => {
    const { data } = await api.get('/user/addresses');
    // API returns { success: true, data: [...] }
    const addresses = data.data || data.addresses || [];
    return Array.isArray(addresses) ? addresses.map((addr: Record<string, unknown>) => ({
      id: addr.id as string,
      userId: (addr.user_id || addr.userId) as string,
      title: addr.title as string,
      fullAddress: (addr.full_address || addr.fullAddress) as string,
      city: addr.city as string,
      district: (addr.district || null) as string | null,
      street: (addr.street || null) as string | null,
      building: (addr.building || null) as string | null,
      apartment: (addr.apartment || null) as string | null,
      entrance: (addr.entrance || null) as string | null,
      floor: (addr.floor || null) as string | null,
      latitude: addr.latitude as number | null,
      longitude: addr.longitude as number | null,
      isDefault: (addr.is_default ?? addr.isDefault ?? false) as boolean,
      createdAt: (addr.created_at || addr.createdAt || '') as string,
    })) : [];
  },

  createAddress: async (address: Omit<Address, 'id' | 'userId' | 'createdAt'>): Promise<Address> => {
    const { data } = await api.post('/user/addresses', address);
    return data.address || data;
  },

  updateAddress: async (id: string, address: Partial<Address>): Promise<Address> => {
    const { data } = await api.put(`/user/addresses/${id}`, address);
    return data.address || data;
  },

  deleteAddress: async (id: string): Promise<void> => {
    await api.delete(`/user/addresses/${id}`);
  },

  setDefaultAddress: async (id: string): Promise<void> => {
    await api.post(`/user/addresses/${id}/default`);
  },

  // Favorites
  getFavorites: async (): Promise<Product[]> => {
    const { data } = await api.get('/user/favorites');
    // API returns { success: true, data: [...] }
    const products = data.data || data.favorites || [];
    return Array.isArray(products) ? products.map((p: Record<string, unknown>) => ({
      id: p.id as string,
      name: p.name as string,
      categoryId: (p.category_id || p.categoryId) as string,
      photos: (p.photos || []) as string[],
      specifications: p.specifications || {},
      dailyPrice: (p.daily_price ?? p.dailyPrice ?? 0) as number,
      pricingTiers: (p.pricing_tiers || p.pricingTiers || []) as Product['pricingTiers'],
      quantityPricing: (p.quantity_pricing || p.quantityPricing || []) as Product['quantityPricing'],
      totalStock: (p.total_stock ?? p.totalStock ?? 0) as number,
      isActive: (p.is_active ?? p.isActive ?? true) as boolean,
      createdAt: (p.created_at || p.createdAt || '') as string,
    })) : [];
  },

  addToFavorites: async (productId: string): Promise<void> => {
    // API expects product_id in the body, not URL
    await api.post('/user/favorites', { product_id: productId });
  },

  removeFromFavorites: async (productId: string): Promise<void> => {
    await api.delete(`/user/favorites/${productId}`);
  },

  // Cards
  getCards: async (): Promise<Card[]> => {
    const { data } = await api.get('/user/cards');
    // API returns { success: true, data: [...] }
    const cards = data.data || data.cards || [];
    return Array.isArray(cards) ? cards.map((card: Record<string, unknown>) => ({
      id: card.id as string,
      userId: (card.user_id || card.userId) as string,
      cardNumber: (card.card_number || card.cardNumber) as string,
      cardHolder: (card.card_holder || card.cardHolder) as string,
      expiryMonth: (card.expiry_month ?? card.expiryMonth) as number,
      expiryYear: (card.expiry_year ?? card.expiryYear) as number,
      cardType: (card.card_type || card.cardType) as string,
      isDefault: (card.is_default ?? card.isDefault ?? false) as boolean,
      createdAt: (card.created_at || card.createdAt || '') as string,
    })) : [];
  },

  addCard: async (cardNumber: string, expiryDate: string): Promise<Card> => {
    const { data } = await api.post('/user/cards', { card_number: cardNumber, expiry_date: expiryDate });
    return data.card || data;
  },

  deleteCard: async (id: string): Promise<void> => {
    await api.delete(`/user/cards/${id}`);
  },

  setDefaultCard: async (id: string): Promise<void> => {
    await api.post(`/user/cards/${id}/default`);
  },
};

// Orders API
export const ordersApi = {
  create: async (order: {
    items: { product_id: string; quantity: number }[];
    rental_start_date: string;
    rental_end_date: string;
    delivery_type: 'DELIVERY' | 'SELF_PICKUP';
    address_id?: string;
    payment_method: 'PAYME' | 'CLICK' | 'UZUM';
    notes?: string;
  }): Promise<Order> => {
    // Map address_id to delivery_address_id expected by the API
    const apiPayload = {
      items: order.items,
      rental_start_date: order.rental_start_date,
      rental_end_date: order.rental_end_date,
      delivery_type: order.delivery_type,
      delivery_address_id: order.address_id,
      payment_method: order.payment_method,
      notes: order.notes,
    };
    const { data } = await api.post('/orders', apiPayload);
    // API returns { success: true, data: {...} }
    const orderData = data.data || data.order || data;
    return orderData;
  },

  getMyOrders: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Order>> => {
    const { data } = await api.get('/orders/my-orders', { params });
    // API returns { success: true, data: [...], pagination: {...} }
    const orders = data.data || data.orders || [];
    const pagination = data.pagination || {};
    return {
      items: Array.isArray(orders) ? orders : [],
      total: pagination.total_count || 0,
      page: pagination.current_page || 1,
      limit: pagination.limit || 20,
      totalPages: pagination.total_pages || 1,
    };
  },

  getById: async (id: string): Promise<Order> => {
    const { data } = await api.get(`/orders/${id}`);
    // API returns { success: true, data: {...} }
    return data.data || data.order || data;
  },
};

// Business Settings API
export const settingsApi = {
  getBusinessSettings: async (): Promise<BusinessSettings> => {
    const { data } = await api.get('/business/info');
    // API returns { success: true, data: {...} }
    const settings = data.data || data.settings || data;
    return {
      name: settings.name || '',
      phone: settings.phone || '',
      address: settings.address || '',
      latitude: settings.latitude,
      longitude: settings.longitude,
      workingHours: settings.working_hours || settings.workingHours || '',
      telegramUrl: settings.telegram_url || settings.telegramUrl,
      deliveryInfo: settings.delivery_info || settings.deliveryInfo,
    };
  },

  getDeliveryZones: async (): Promise<DeliveryZone[]> => {
    const { data } = await api.get('/settings/delivery-zones');
    // API likely returns { success: true, data: [...] }
    const zones = data.data || data.zones || [];
    return Array.isArray(zones) ? zones : [];
  },
};

export default api;
