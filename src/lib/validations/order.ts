// src/lib/validations/order.ts
import { z } from "zod";

export const cartItemSchema = z.object({
  productId:         z.string().cuid(),
  variantId:         z.string().cuid().optional(),
  quantity:          z.number().int().min(1).max(100),
  customizationJson: z.record(z.string(), z.unknown()).optional(),
});

export const checkoutSchema = z.object({
  addressId:     z.string().cuid(),
  paymentMethod: z.enum(["RAZORPAY", "COD"]),
  couponCode:    z.string().max(50).optional(),
  notes:         z.string().max(500).optional(),
});

export const addressSchema = z.object({
  label:   z.string().max(50).default("Home"),
  line1:   z.string().min(5, "Address too short").max(255),
  line2:   z.string().max(255).optional(),
  city:    z.string().min(2).max(100),
  state:   z.string().min(2).max(100),
  country: z.string().default("India"),
  pincode: z.string().regex(/^\d{6}$/, "Invalid pincode"),
  isDefault: z.boolean().default(false),
});

export const couponSchema = z.object({
  code:     z.string().min(1).max(50),
  subtotal: z.number().min(0),
});

export type CartItemInput  = z.infer<typeof cartItemSchema>;
export type CheckoutInput  = z.infer<typeof checkoutSchema>;
export type AddressInput   = z.infer<typeof addressSchema>;
export type CouponInput    = z.infer<typeof couponSchema>;
