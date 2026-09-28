/**
 * src/lib/security/csrf.ts
 * CSRF protection — generates tokens, validates on state-changing requests.
 * Uses the "double-submit cookie" pattern compatible with Next.js edge middleware.
 */

import { NextRequest, NextResponse } from "next/server";

export const CSRF_COOKIE = "csrf_token";
export const CSRF_HEADER = "x-csrf-token";

/** Generate a new CSRF token (UUID v4 format) */
export function generateCsrfToken(): string {
  return crypto.randomUUID();
}

/**
 * Validate CSRF token on a request.
 * The cookie value must match the header value exactly.
 * Returns true if valid, false if mismatch (should → 403).
 *
 * Skip validation for:
 * - GET, HEAD, OPTIONS (safe methods)
 * - Requests from non-browser origins (API clients using Bearer tokens)
 */
export function validateCsrf(req: NextRequest): boolean {
  const method = req.method.toUpperCase();

  // Safe methods don't need CSRF protection
  if (["GET", "HEAD", "OPTIONS"].includes(method)) return true;

  // If Authorization header is present → API client, skip CSRF
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return true;

  const cookieToken = req.cookies.get(CSRF_COOKIE)?.value;
  const headerToken = req.headers.get(CSRF_HEADER);

  if (!cookieToken || !headerToken) return false;
  return cookieToken === headerToken;
}

/**
 * Set a new CSRF token cookie on a response.
 * Call this after successful login, or when serving the first page.
 */
export function setCsrfCookie(res: NextResponse, token: string): void {
  res.cookies.set(CSRF_COOKIE, token, {
    httpOnly: false,  // Must be readable by JS to put in headers
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

/** Get CSRF token from cookie, or generate a new one if missing */
export function getOrCreateCsrfToken(req: NextRequest): { token: string; isNew: boolean } {
  const existing = req.cookies.get(CSRF_COOKIE)?.value;
  if (existing) return { token: existing, isNew: false };
  return { token: generateCsrfToken(), isNew: true };
}
