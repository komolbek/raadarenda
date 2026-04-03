import { z } from 'zod';
import { phoneNumberSchema } from './common';

export const sendOtpSchema = z.object({
  phone_number: phoneNumberSchema,
});

export const verifyOtpSchema = z.object({
  phone_number: phoneNumberSchema,
  code: z.string().length(6, 'Code must be 6 digits'),
  device_id: z.string().min(1, 'Device ID required'),
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
