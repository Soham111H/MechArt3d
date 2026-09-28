/**
 * src/lib/security/security-log.ts
 * Centralized security event logger — writes to ActivityLog table.
 * Append-only. Never call DELETE or UPDATE on activity_logs.
 */

import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";

export type SecurityEvent =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "LOGIN_LOCKED"
  | "LOGOUT"
  | "PASSWORD_CHANGED"
  | "PASSWORD_RESET_REQUESTED"
  | "PASSWORD_RESET_COMPLETED"
  | "ADMIN_LOGIN"
  | "ADMIN_2FA_FAILED"
  | "RATE_LIMIT_HIT"
  | "PAYMENT_FAILED"
  | "PAYMENT_SIGNATURE_MISMATCH"
  | "SUSPICIOUS_REQUEST"
  | "ADMIN_ACTION"
  | "ACCOUNT_BANNED"
  | "SESSION_REVOKED"
  | "EXPORT_DATA"
  | "PERMISSION_DENIED";

interface LogOptions {
  userId?: string | null;
  event:   SecurityEvent;
  module?: string;
  ip?:     string;
  device?: string;
  details?: Record<string, unknown>;
}

// Simple in-memory cache of the last log entry hash for chaining
let lastEntryHash: string | null = null;

function computeHash(entry: {
  event: string;
  userId?: string | null;
  createdAt: string;
  prevHash: string | null;
}): string {
  const payload = JSON.stringify(entry);
  return createHash("sha256").update(payload).digest("hex");
}

/**
 * Log a security event to the activity_logs table.
 * Each entry includes the hash of the previous entry for tamper detection.
 * Never throws — security logging must not crash the app.
 */
export async function logSecurityEvent(opts: LogOptions): Promise<void> {
  try {
    const now = new Date().toISOString();
    const prevHash = lastEntryHash;

    const entryHash = computeHash({
      event:      opts.event,
      userId:     opts.userId ?? null,
      createdAt:  now,
      prevHash,
    });

    lastEntryHash = entryHash;

    // Only write to DB if userId is available (ActivityLog requires userId)
    if (opts.userId) {
      await prisma.activityLog.create({
        data: {
          userId:     opts.userId,
          action:     opts.event,
          module:     opts.module ?? "SECURITY",
          ipAddress:  opts.ip ?? null,
          deviceInfo: opts.device ?? null,
          details:    {
            ...(opts.details ?? {}),
            _hash:    entryHash,
            _prevHash: prevHash,
          },
        },
      });
    }

    // Always log to console (Railway captures this)
    const logLine = `[SECURITY] ${now} | ${opts.event} | user=${opts.userId ?? "anonymous"} | ip=${opts.ip ?? "?"} | ${JSON.stringify(opts.details ?? {})}`;
    if (opts.event.includes("FAILED") || opts.event.includes("MISMATCH") || opts.event.includes("SUSPICIOUS")) {
      console.warn(logLine);
    } else {
      console.info(logLine);
    }
  } catch (err) {
    // Never let logging errors crash the app
    console.error("[security-log] Failed to write security event:", err);
  }
}

/**
 * Quick helper for admin action logging.
 * Call this inside every /api/admin/* route handler before the mutation.
 */
export async function logAdminAction(
  userId: string,
  action: string,
  module: string,
  details?: Record<string, unknown>,
  ip?: string
): Promise<void> {
  return logSecurityEvent({
    userId,
    event:   "ADMIN_ACTION",
    module,
    ip,
    details: { action, ...details },
  });
}

/** Helper to return standard 429 response with retry-after header */
export function rateLimitResponse(resetAt: number) {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
  return new Response(
    JSON.stringify({ error: "Too many requests. Please try again later." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": retryAfter.toString(),
        "X-RateLimit-Reset": new Date(resetAt).toUTCString(),
      },
    }
  );
}
