// src/app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmail, passwordResetTemplate } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import { logSecurityEvent } from "@/lib/security/security-log";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const ip = getClientIp(req);
    const rlIp = await rateLimit(`forgot-pwd:${ip}`, 3, 60 * 60 * 1000);
    const rlEmail = await rateLimit(`forgot-pwd:${email.toLowerCase().trim()}`, 3, 60 * 60 * 1000);

    if (!rlIp.allowed || !rlEmail.allowed) {
      await logSecurityEvent({
        event: "RATE_LIMIT_HIT",
        ip,
        module: "AUTH",
        details: { target: email, limit: "3/hr" }
      });
      return NextResponse.json({ error: "Too many password reset requests. Please try again later." }, { status: 429 });
    }

    // Always respond with success to prevent email enumeration
    const user = await prisma.user.findUnique({
      where:  { email: email.toLowerCase().trim() },
      select: { id: true, name: true, email: true },
    });

    if (user) {
      // Generate a secure random token
      const rawToken  = crypto.randomBytes(32).toString("hex");
      const tokenHash = await bcrypt.hash(rawToken, 10);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Invalidate any existing reset tokens for this user
      await prisma.otpCode.deleteMany({
        where: { identifier: user.email, type: "PWD_RESET" },
      });

      // Save hashed token
      await prisma.otpCode.create({
        data: {
          identifier: user.email,
          codeHash:   tokenHash,
          type:       "PWD_RESET",
          expiresAt,
        },
      });

      // Build reset URL with raw token
      const resetUrl = `${process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

      // Send email — wrapped in its own try/catch so SMTP failures don't crash the whole route
      try {
        const template = passwordResetTemplate(user.name || "", resetUrl);
        await sendEmail({
          to:      user.email,
          subject: template.subject,
          html:    template.html,
          text:    template.text,
        });
      } catch (emailError) {
        // Log the error but DON'T throw — the token was saved so the link still works
        console.error("[forgot-password] Email sending failed:", emailError);
        // In dev: print the reset link so you can test without email configured
        if (process.env.NODE_ENV === "development") {
          console.log("\n🔗 [DEV] Password Reset URL (email not sent):");
          console.log(`   ${resetUrl}\n`);
        }
      }
    }

    // Always return success (security: don't reveal if email exists)
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
