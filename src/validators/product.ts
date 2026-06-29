import { z } from 'zod';

export const productFilterSchema = z.object({
  category: z.string().optional(),
  search: z.string().trim().max(100).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'popular']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  featured: z.coerce.boolean().optional(),
  inStock: z.coerce.boolean().optional(),
});

export const productSearchSchema = z.object({
  search: z.string().trim().min(1, 'Search query cannot be empty').max(100),
});
