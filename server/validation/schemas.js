// ============================================================
//  Zod Validation Schemas — Spill The Beans API
// ============================================================
import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// SHARED PRIMITIVES
// ─────────────────────────────────────────────────────────────
const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number');

const pincodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, 'Must be a valid 6-digit pincode');

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─────────────────────────────────────────────────────────────
// USER
// ─────────────────────────────────────────────────────────────
export const createUserSchema = z.object({
  clerkId: z.string().min(1),
  email: z.string().email(),
  name: z.string().trim().min(2).max(100).optional(),
  phone: phoneSchema.optional(),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: phoneSchema.optional(),
});

// ─────────────────────────────────────────────────────────────
// ADDRESS
// ─────────────────────────────────────────────────────────────
export const addressSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: phoneSchema,
  line1: z.string().trim().min(5).max(200),
  line2: z.string().trim().max(200).optional().nullable(),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  pincode: pincodeSchema,
  isDefault: z.boolean().default(false),
});

// ─────────────────────────────────────────────────────────────
// PRODUCT
// ─────────────────────────────────────────────────────────────
export const productQuerySchema = paginationSchema.extend({
  category: z.string().optional(),
  categorySlug: z.string().optional(),
  search: z.string().trim().max(100).optional(),
  roast: z.enum(['Light', 'Medium', 'Medium-Dark', 'Dark', 'Extra Dark', 'Assorted']).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  featured: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  isBestseller: z.coerce.boolean().optional(),
  isNew: z.coerce.boolean().optional(),
  isLimited: z.coerce.boolean().optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'popular']).optional(),
  sortBy: z.enum(['price', 'createdAt', 'name', 'stock']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ─────────────────────────────────────────────────────────────
// CART
// ─────────────────────────────────────────────────────────────
export const addCartItemSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().min(1).max(10).default(1),
  variant: z.string().trim().max(50).optional().nullable(),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0).max(10),
});

// ─────────────────────────────────────────────────────────────
// ORDER
// ─────────────────────────────────────────────────────────────
export const placeOrderSchema = z.object({
  addressId: z.string().cuid(),
  paymentMethod: z.enum(['RAZORPAY', 'STRIPE', 'COD', 'UPI']),
  couponCode: z.string().trim().max(32).optional(),
  notes: z.string().trim().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED',
  ]),
});

// ─────────────────────────────────────────────────────────────
// COUPON
// ─────────────────────────────────────────────────────────────
export const createCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(32)
    .regex(/^[A-Z0-9_]+$/, 'Code must be uppercase letters, numbers, or underscores only'),
  type: z.enum(['PERCENTAGE', 'FIXED', 'FREE_SHIPPING']),
  value: z.number().int().min(0),
  minOrderAmount: z.number().int().min(0).optional(),
  maxDiscount: z.number().int().min(0).optional(),
  usageLimit: z.number().int().min(1).optional(),
  perUserLimit: z.number().int().min(1).default(1),
  isActive: z.boolean().default(true),
  expiresAt: z.coerce.date().optional(),
});

export const applyCouponSchema = z.object({
  code: z.string().trim().min(1).max(32),
  subtotal: z.number().int().min(0),
});

// ─────────────────────────────────────────────────────────────
// REVIEW
// ─────────────────────────────────────────────────────────────
export const createReviewSchema = z.object({
  productId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().max(2000).optional(),
});
