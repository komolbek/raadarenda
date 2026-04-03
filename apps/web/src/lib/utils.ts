import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, differenceInDays } from 'date-fns';
import type { IPricingTier, IQuantityPricing } from '@4event/types';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price in UZS currency
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' UZS';
}

/**
 * Format date string to readable format
 */
export function formatDate(dateStr: string, fmt: string = 'dd MMM yyyy'): string {
  return format(new Date(dateStr), fmt);
}

/**
 * Calculate rental price based on pricing tiers and quantity pricing
 */
export function calculatePrice(params: {
  dailyPrice: number;
  pricingTiers: IPricingTier[];
  quantityPricing: IQuantityPricing[];
  startDate: string;
  endDate: string;
  quantity: number;
}): { totalPrice: number; dailyRate: number; days: number; savings: number } {
  const { dailyPrice, pricingTiers, quantityPricing, startDate, endDate, quantity } = params;
  const days = differenceInDays(new Date(endDate), new Date(startDate)) + 1;

  // Find matching pricing tier (best match for days)
  const sortedTiers = [...pricingTiers].sort((a, b) => b.days - a.days);
  const matchingTier = sortedTiers.find((tier) => days >= tier.days);

  // Find matching quantity pricing
  const sortedQty = [...quantityPricing].sort((a, b) => b.quantity - a.quantity);
  const matchingQty = sortedQty.find((q) => quantity >= q.quantity);

  let totalPrice: number;
  const baseTotal = dailyPrice * days * quantity;

  if (matchingQty && matchingTier) {
    // Use the better discount
    const tierTotal = matchingTier.totalPrice * quantity;
    const qtyTotal = matchingQty.totalPrice * days;
    totalPrice = Math.min(tierTotal, qtyTotal);
  } else if (matchingTier) {
    totalPrice = matchingTier.totalPrice * quantity;
  } else if (matchingQty) {
    totalPrice = matchingQty.totalPrice * days;
  } else {
    totalPrice = baseTotal;
  }

  const savings = baseTotal - totalPrice;
  const dailyRate = days > 0 ? totalPrice / days / quantity : dailyPrice;

  return { totalPrice, dailyRate, days, savings };
}

/**
 * Generate a unique device ID for auth
 */
export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server';

  const stored = localStorage.getItem('device_id');
  if (stored) return stored;

  const id = crypto.randomUUID();
  localStorage.setItem('device_id', id);
  return id;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

/**
 * Get initials from name
 */
export function getInitials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Pluralize rental days
 */
export function pluralizeDays(count: number): string {
  if (count === 1) return '1 day';
  return `${count} days`;
}
