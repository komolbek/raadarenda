import { z } from 'zod';

export const createExtensionSchema = z.object({
  order_id: z.string().min(1),
  additional_days: z.number().int().min(1).max(365),
  notes: z.string().max(500).optional().nullable(),
});

export const updateExtensionSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  notes: z.string().max(500).optional().nullable(),
});

export type CreateExtensionInput = z.infer<typeof createExtensionSchema>;
export type UpdateExtensionInput = z.infer<typeof updateExtensionSchema>;
