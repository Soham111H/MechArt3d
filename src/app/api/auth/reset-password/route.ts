// src/app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, email, password } = body ?? {};

    if (!token || !email || !password) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Enforce same password policy as registration (uppercase + lowercase + number + special char)
    const pwdPolicyRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!pwdPolicyRegex.test(password)) {
      return NextResponse.json({
        error: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
      }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find the most recent valid, unused OTP record for this email
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        identifier: normalizedEmail,
        type:       "PWD_RESET",
        usedAt:     null,
        expiresAt:  { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Reset link is invalid or has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Verify the raw token against the stored hash
    const isValid = await bcrypt.compare(token, otpRecord.codeHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Reset link is invalid or has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where:  { email: normalizedEmail },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    // Hash the new password
    const newHash = await bcrypt.hash(password, 12);

    // Update password + mark token as used atomically
    // NOTE: prisma.$transaction only accepts PrismaPromise — no .then() calls inside!
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data:  { passwordHash: newHash },
      }),
      prisma.otpCode.update({
        where: { id: otpRecord.id },
        data:  { usedAt: new Date() },
      }),
      prisma.passwordHistory.create({
        data: { userId: user.id, passwordHash: newHash },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Password reset successfully! You can now sign in.",
    });

  } catch (error) {
    console.error("[reset-password] Error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
