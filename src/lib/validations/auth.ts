// src/lib/validations/auth.ts
import { z } from "zod";

import { isPossiblePhoneNumber } from "react-phone-number-input";
import { differenceInYears } from "date-fns";

export const registerSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be at most 50 characters")
    .regex(/^[A-Za-z\s]+$/, "Letters and spaces only"),
  email: z.string().email("Invalid email address"),
  phone: z.string().refine((val) => isPossiblePhoneNumber(val), {
    message: "Invalid phone number format",
  }),
  dob: z.string().refine((val) => {
    const age = differenceInYears(new Date(), new Date(val));
    return age >= 13;
  }, { message: "You must be at least 13 years old" }),
  gender: z.enum(["MALE", "FEMALE", "NON_BINARY", "PREFER_NOT_TO_SAY"]),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms",
  }),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  confirmPassword: z.string(),
  token: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RegisterInput       = z.infer<typeof registerSchema>;
export type LoginInput           = z.infer<typeof loginSchema>;
export type ForgotPasswordInput  = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput   = z.infer<typeof resetPasswordSchema>;
