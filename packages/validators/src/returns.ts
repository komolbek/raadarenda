import { z } from 'zod';

export const createReturnSchema = z.object({
  order_id: z.string().min(1),
  reason: z.string().max(1000).optional().nullable(),
  photos: z.array(z.string()).max(10).optional(),
});

export const updateReturnSchema = z.object({
  status: z.enum([
    'REQUESTED', 'APPROVED', 'PICKUP_SCHEDULED', 'PICKED_UP',
    'INSPECTED', 'REFUND_ISSUED', 'COMPLETED', 'REJECTED',
  ]).optional(),
  damage_level: z.enum(['NONE', 'MINOR', 'MODERATE', 'SEVERE']).optional(),
  damage_notes: z.string().max(1000).optional().nullable(),
  damage_fee: z.number().int().min(0).optional(),
  refund_amount: z.number().int().min(0).optional(),
  pickup_date: z.string().optional().nullable(),
  inspection_notes: z.string().max(1000).optional().nullable(),
});

export type CreateReturnInput = z.infer<typeof createReturnSchema>;
export type UpdateReturnInput = z.infer<typeof updateReturnSchema>;
