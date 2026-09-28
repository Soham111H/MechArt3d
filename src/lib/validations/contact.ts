// src/lib/validations/contact.ts
import { z } from "zod";

export const contactSchema = z.object({
  name:    z.string().min(2, "Name too short").max(100),
  email:   z.string().email("Invalid email"),
  phone:   z.string().max(15).optional(),
  subject: z.string().min(3).max(200),
  message: z.string().min(10, "Message too short").max(2000),
});

export const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
  name:  z.string().max(255).optional(),
});

export const customRequestSchema = z.object({
  title:       z.string().min(3, "Title too short").max(255),
  description: z.string().min(10, "Please describe your requirement").max(3000),
  material:    z.string().max(100).optional(),
  color:       z.string().max(50).optional(),
  quantity:    z.number().int().min(1).max(10000),
  budget:      z.number().min(0).optional(),
  fileUrl:     z.string().url().optional().or(z.literal("")),
});

export type ContactInput        = z.infer<typeof contactSchema>;
export type NewsletterInput     = z.infer<typeof newsletterSchema>;
export type CustomRequestInput  = z.infer<typeof customRequestSchema>;
