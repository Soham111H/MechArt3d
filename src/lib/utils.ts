// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Automatically crops a Cloudinary URL to focus on the face and makes it square.
 */
export function getAvatarUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (!url.includes("cloudinary.com/")) return url;
  
  // Insert Cloudinary transformation for smart face cropping
  // e.g., https://res.cloudinary.com/.../upload/v123... -> .../upload/c_thumb,g_face,w_200,h_200/v123...
  return url.replace("/upload/", "/upload/c_thumb,g_face,w_200,h_200/");
}

export function formatPrice(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + "…" : str;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}
