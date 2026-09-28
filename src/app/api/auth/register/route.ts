import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import { sanitizeString } from "@/lib/security/sanitize";
import { logSecurityEvent } from "@/lib/security/security-log";
import { enqueueEmail } from "@/lib/email/queue";


// Body size guard — reject huge payloads
const MAX_BODY_BYTES = 1 * 1024 * 1024; // 1 MB

const bodySchema = z.object({
  name:     z.string().min(2).max(100),
  email:    z.string().email().max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
  phone:     z.string().max(20).optional(),
});

export async function POST(req: NextRequest) {
  // ── 1. Rate limit — 5 registrations per hour per IP ───────────────────────
  const ip = getClientIp(req);
  const rl = await rateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ message: "Too many registration attempts. Please try again later." }, { status: 429 });
  }

  try {
    // ── 2. Body size check ─────────────────────────────────────────────────────
    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ message: "Request too large" }, { status: 413 });
    }

    const body = await req.json();

    // ── 3. Zod validation ──────────────────────────────────────────────────────
    const data = bodySchema.parse(body);

    // ── 4. Sanitize string inputs ──────────────────────────────────────────────
    const name  = sanitizeString(data.name);
    const email = data.email.toLowerCase().trim();

    // ── 5. Duplicate check ─────────────────────────────────────────────────────
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // Generic message — don't reveal account existence to scrapers
      return NextResponse.json(
        { message: "If this email is not already registered, your account has been created." },
        { status: 200 } // Return 200 to prevent enumeration
      );
    }

    // ── 6. Hash with bcrypt rounds=12 ─────────────────────────────────────────
    const passwordHash = await bcrypt.hash(data.password, 12);

    // ── 7. Create user ─────────────────────────────────────────────────────────
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: "USER" },
      select: { id: true, email: true, name: true },
    });

    await logSecurityEvent({
      userId: user.id,
      event: "LOGIN_SUCCESS",
      module: "REGISTER",
      ip,
      details: { action: "account_created", email },
    });

    // Fire welcome email (non-blocking)
    enqueueEmail({
      userId: user.id,
      to: user.email,
      type: "welcome",
      templateArgs: [user.name || "there", "WELCOME10"],
    });

    return NextResponse.json({ message: "Account created successfully", user }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input", errors: err.issues }, { status: 422 });
    }
    console.error("[register] Error:", err);
    // Generic error — never expose stack traces
    return NextResponse.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }
}
