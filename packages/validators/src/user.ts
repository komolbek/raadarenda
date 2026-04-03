import { z } from 'zod';

export const createAddressSchema = z.object({
  title: z.string().min(1),
  full_address: z.string().min(1),
  city: z.string().min(1),
  district: z.string().optional().nullable(),
  street: z.string().optional().nullable(),
  building: z.string().optional().nullable(),
  apartment: z.string().optional().nullable(),
  entrance: z.string().optional().nullable(),
  floor: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

export const createCardSchema = z.object({
  card_number: z.string().min(13).max(19),
  card_holder: z.string().min(1),
  expiry_month: z.number().int().min(1).max(12),
  expiry_year: z.number().int().min(24).max(99),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
