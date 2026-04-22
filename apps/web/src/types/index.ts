// Re-export types from @4event/types with aliases used by the web app
export type { IAddress as Address, IProduct as Product } from '@4event/types';

// String literal union types matching the enum values from @4event/types
// Used in consumer components that pass string literals directly
export type DeliveryType = 'DELIVERY' | 'SELF_PICKUP';
export type PaymentMethod = 'CASH' | 'ONLINE' | 'UZUM' | 'RAHMAT' | 'BANK_TRANSFER';
export type OrderStatus = 'CONFIRMED' | 'PREPARING' | 'DELIVERED' | 'RETURNED' | 'CANCELLED';

// Category type used by UI components (maps ICategory fields to simpler names)
export type Category = {
  id: string;
  name: string;
  image: string | null;
  icon: string | null;
  parentCategoryId: string | null;
  displayOrder: number;
  isActive: boolean;
  children?: Category[];
  _count?: { products: number };
  createdAt: string;
};
