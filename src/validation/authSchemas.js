// ============================================================
//  Client-side Zod Validation Schemas — Auth & Account
// ============================================================
import { z } from 'zod';

const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number');

export const ProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be under 100 characters'),
  phone: phoneSchema.optional().or(z.literal('')),
});

export const AddressSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(100),
  phone: phoneSchema,
  line1: z.string().trim().min(5, 'Address line 1 is required').max(200),
  line2: z.string().trim().max(200).optional().or(z.literal('')),
  city: z.string().trim().min(2, 'City is required').max(100),
  state: z.string().trim().min(2, 'State is required').max(100),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  isDefault: z.boolean().default(false),
});
