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
    const userData = data.data || data.user || data;
    return {
      id: userData.id,
      phoneNumber: userData.phone_number || userData.phoneNumber || '',
      name: userData.name || null,
      createdAt: userData.created_at || userData.createdAt || '',
    };
  },

  updateProfile: async (name: string): Promise<User> => {
    const { data } = await api.post('/user/profile', { name });
    const userData = data.data || data.user || data;
    return {
      id: userData.id,
      phoneNumber: userData.phone_number || userData.phoneNumber || '',
      name: userData.name || null,
      createdAt: userData.created_at || userData.createdAt || '',
    };
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
    return Array.isArray(cards) ? cards.map((card: Record<string, unknown>) => {
      // Combine expiry_month and expiry_year into expiryDate format MM/YY
      const expiryMonth = (card.expiry_month ?? card.expiryMonth ?? 1) as number;
      const expiryYear = (card.expiry_year ?? card.expiryYear ?? 25) as number;
      const expiryDate = `${String(expiryMonth).padStart(2, '0')}/${String(expiryYear).padStart(2, '0')}`;
      const cardType = ((card.card_type || card.cardType || 'UNKNOWN') as string).toUpperCase();

      return {
        id: card.id as string,
        userId: (card.user_id || card.userId) as string,
        cardNumber: (card.card_number || card.cardNumber) as string,
        cardType: cardType as Card['cardType'],
        expiryDate,
        isDefault: (card.is_default ?? card.isDefault ?? false) as boolean,
        createdAt: (card.created_at || card.createdAt || '') as string,
      };
    }) : [];
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

    // Map snake_case to camelCase for orders
    const mappedOrders = Array.isArray(orders) ? orders.map((order: Record<string, unknown>) => ({
      id: order.id as string,
      orderNumber: (order.order_number || order.orderNumber) as string,
      userId: (order.user_id || order.userId) as string,
      status: order.status as string,
      items: Array.isArray(order.items) ? order.items.map((item: Record<string, unknown>) => ({
        id: item.id,
        orderId: item.order_id || item.orderId,
        productId: item.product_id || item.productId,
        product: item.product,
        quantity: item.quantity,
        dailyPrice: item.daily_price || item.dailyPrice,
        totalPrice: item.total_price || item.totalPrice,
        rentalDays: item.rental_days || item.rentalDays,
      })) : [],
      deliveryType: (order.delivery_type || order.deliveryType) as string,
      deliveryAddress: order.delivery_address || order.deliveryAddress,
      deliveryAddressId: (order.delivery_address_id || order.deliveryAddressId) as string | null,
      deliveryFee: (order.delivery_fee || order.deliveryFee || 0) as number,
      subtotal: (order.subtotal || 0) as number,
      totalAmount: (order.total_amount || order.totalAmount || 0) as number,
      totalSavings: (order.total_savings || order.totalSavings || 0) as number,
      rentalStartDate: (order.rental_start_date || order.rentalStartDate || '') as string,
      rentalEndDate: (order.rental_end_date || order.rentalEndDate || '') as string,
      paymentMethod: (order.payment_method || order.paymentMethod) as string,
      paymentStatus: (order.payment_status || order.paymentStatus) as string,
      notes: (order.notes || null) as string | null,
      createdAt: (order.created_at || order.createdAt || '') as string,
      updatedAt: (order.updated_at || order.updatedAt || '') as string,
    })) : [];

    return {
      items: mappedOrders as Order[],
      total: pagination.total_count || pagination.total || 0,
      page: pagination.current_page || pagination.page || 1,
      limit: pagination.limit || 20,
      totalPages: pagination.total_pages || pagination.totalPages || 1,
    };
  },

  getById: async (id: string): Promise<Order> => {
    const { data } = await api.get(`/orders/${id}`);
    // API returns { success: true, data: {...} }
    const order = data.data || data.order || data;
    return {
      id: order.id,
      orderNumber: order.order_number || order.orderNumber,
      userId: order.user_id || order.userId,
      status: order.status,
      items: Array.isArray(order.items) ? order.items.map((item: Record<string, unknown>) => ({
        id: item.id,
        orderId: item.order_id || item.orderId,
        productId: item.product_id || item.productId,
        product: item.product,
        quantity: item.quantity,
        dailyPrice: item.daily_price || item.dailyPrice,
        totalPrice: item.total_price || item.totalPrice,
        rentalDays: item.rental_days || item.rentalDays,
      })) : [],
      deliveryType: order.delivery_type || order.deliveryType,
      deliveryAddress: order.delivery_address || order.deliveryAddress,
      deliveryAddressId: order.delivery_address_id || order.deliveryAddressId,
      deliveryFee: order.delivery_fee || order.deliveryFee || 0,
      subtotal: order.subtotal || 0,
      totalAmount: order.total_amount || order.totalAmount || 0,
      totalSavings: order.total_savings || order.totalSavings || 0,
      rentalStartDate: order.rental_start_date || order.rentalStartDate || '',
      rentalEndDate: order.rental_end_date || order.rentalEndDate || '',
      paymentMethod: order.payment_method || order.paymentMethod,
      paymentStatus: order.payment_status || order.paymentStatus,
      notes: order.notes || null,
      createdAt: order.created_at || order.createdAt || '',
      updatedAt: order.updated_at || order.updatedAt || '',
    } as Order;
  },
};

// Business Settings API
export const settingsApi = {
  getBusinessSettings: async (): Promise<BusinessSettings> => {
    const { data } = await api.get('/business/info');
    // API returns { success: true, data: {...} }
    const settings = data.data || data.settings || data;

    // Parse working_hours string (e.g., "09:00 - 18:00") into the expected format
    const workingHoursStr = settings.working_hours || settings.workingHours || '09:00 - 18:00';
    const [open, close] = workingHoursStr.split(' - ').map((s: string) => s.trim());
    const workingHours: BusinessSettings['workingHours'] = {
      monday: { open, close },
      tuesday: { open, close },
      wednesday: { open, close },
      thursday: { open, close },
      friday: { open, close },
      saturday: { open, close },
      sunday: { open, close, isClosed: true },
    };

    return {
      id: settings.id || 'default',
      businessName: settings.name || settings.businessName || '',
      phone: settings.phone || '',
      address: settings.address || '',
      email: settings.email || null,
      latitude: settings.latitude ?? null,
      longitude: settings.longitude ?? null,
      workingHours,
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
