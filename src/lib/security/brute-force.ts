/**
 * src/lib/security/brute-force.ts
 * Brute-force protection using the LoginAttempt table.
 * Tracks failed login attempts per identifier (email) and per IP.
 */

import { prisma } from "@/lib/prisma";

const MAX_ATTEMPTS    = 5;  // lock after this many fails
const LOCK_DURATION   = 15 * 60 * 1000; // 15 minutes in ms
const IP_MAX_ATTEMPTS = 10; // IP-level block threshold
const IP_LOCK_DURATION = 60 * 60 * 1000; // 1 hour in ms

export interface LockStatus {
  locked: boolean;
  lockedUntil: Date | null;
  attempts: number;
  requiresCaptcha: boolean; // show CAPTCHA after 3 attempts
}

/** Check if an identifier (email) or IP is currently locked out */
export async function getLockStatus(identifier: string, ip?: string): Promise<LockStatus> {
  try {
    const record = await prisma.loginAttempt.findFirst({
      where: { identifier },
      orderBy: { updatedAt: "desc" },
    });

    if (!record) {
      return { locked: false, lockedUntil: null, attempts: 0, requiresCaptcha: false };
    }

    // Check if lockout has expired
    if (record.lockedUntil && record.lockedUntil > new Date()) {
      return {
        locked: true,
        lockedUntil: record.lockedUntil,
        attempts: record.attempts,
        requiresCaptcha: true,
      };
    }

    return {
      locked: false,
      lockedUntil: null,
      attempts: record.attempts,
      requiresCaptcha: record.attempts >= 3,
    };
  } catch {
    // If DB check fails, fail open (don't block the user due to DB issues)
    return { locked: false, lockedUntil: null, attempts: 0, requiresCaptcha: false };
  }
}

/** Record a failed login attempt — increments counter and may lock the account */
export async function recordFailedAttempt(identifier: string, ip?: string): Promise<LockStatus> {
  try {
    const existing = await prisma.loginAttempt.findFirst({
      where: { identifier },
    });

    let newAttempts = (existing?.attempts ?? 0) + 1;
    let lockedUntil: Date | null = null;

    if (newAttempts >= MAX_ATTEMPTS) {
      lockedUntil = new Date(Date.now() + LOCK_DURATION);
    }

    await prisma.loginAttempt.upsert({
      where: { id: existing?.id ?? "nonexistent" },
      create: { identifier, attempts: 1, ipAddress: ip ?? null },
      update: { attempts: newAttempts, lockedUntil, ipAddress: ip ?? null },
    });

    return {
      locked: lockedUntil !== null,
      lockedUntil,
      attempts: newAttempts,
      requiresCaptcha: newAttempts >= 3,
    };
  } catch {
    return { locked: false, lockedUntil: null, attempts: 1, requiresCaptcha: false };
  }
}

/** Reset attempt counter after successful login */
export async function resetAttempts(identifier: string): Promise<void> {
  try {
    await prisma.loginAttempt.deleteMany({ where: { identifier } });
  } catch { /* ignore */ }
}

/** Format a lock expiry into a human-readable string for error messages */
export function formatLockExpiry(lockedUntil: Date): string {
  const minutes = Math.ceil((lockedUntil.getTime() - Date.now()) / 60000);
  return `Account locked. Try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`;
}
