import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import { sanitizeObject } from "@/lib/security/sanitize";

// Body size guard
const MAX_BODY_BYTES = 50 * 1024; // 50 KB limit for contact form

const contactSchema = z.object({
  name:    z.string().min(2).max(100),
  email:   z.string().email().max(255),
  phone:   z.string().max(20).optional().nullable(),
  subject: z.string().max(200).optional().nullable(),
  message: z.string().min(10).max(5000),
});

export async function POST(req: NextRequest) {
  // ── 1. Rate limit — 5 contacts per hour per IP ───────────────────────────
  const ip = getClientIp(req);
  const rl = await rateLimit(`contact:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ message: "Too many messages sent. Please try again later." }, { status: 429 });
  }

  try {
    // ── 2. Body size check ─────────────────────────────────────────────────────
    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ message: "Message is too large." }, { status: 413 });
    }

    const body = await req.json();

    // ── 3. Sanitize and Validate ───────────────────────────────────────────────
    const sanitizedBody = sanitizeObject(body);
    const data = contactSchema.parse(sanitizedBody);

    // ── 4. Save to Database ────────────────────────────────────────────────────
    const message = await prisma.contactMessage.create({
      data: {
        name:    data.name,
        email:   data.email,
        phone:   data.phone,
        subject: data.subject,
        message: data.message,
      }
    });

    return NextResponse.json({ success: true, messageId: message.id }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input data", errors: err.issues }, { status: 400 });
    }
    console.error("[contact] Error:", err);
    return NextResponse.json({ message: "Failed to send message. Please try again later." }, { status: 500 });
  }
}
