// src/lib/validations/product.ts
import { z } from "zod";

export const productFilterSchema = z.object({
  category: z.string().optional(),
  material: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  rating:   z.coerce.number().min(1).max(5).optional(),
  inStock:  z.coerce.boolean().optional(),
  search:   z.string().max(200).optional(),
  sort:     z.enum(["newest", "price_asc", "price_desc", "popular"]).optional(),
  page:     z.coerce.number().min(1).default(1),
  limit:    z.coerce.number().min(1).max(50).default(12),
});

export const reviewSchema = z.object({
  productId: z.string().cuid(),
  rating:    z.number().int().min(1).max(5),
  title:     z.string().max(255).optional(),
  body:      z.string().max(2000).optional(),
});

export type ProductFilterInput = z.infer<typeof productFilterSchema>;
export type ReviewInput        = z.infer<typeof reviewSchema>;
