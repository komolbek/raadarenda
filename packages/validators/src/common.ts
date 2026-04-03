import { z } from 'zod';

export const phoneNumberSchema = z.string().regex(/^\+998\d{9}$/, 'Invalid phone number format');

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
