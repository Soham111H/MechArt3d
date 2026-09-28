import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { identifier, code, type } = await req.json();

    if (!identifier || !code || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find the latest active OTP for this identifier and type
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        identifier,
        type,
        usedAt: null,
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!otpRecord) {
      return NextResponse.json({ error: "No OTP found or it has already been used." }, { status: 400 });
    }

    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    if (otpRecord.attempts >= 3) {
      return NextResponse.json({ error: "Too many failed attempts. Please request a new OTP." }, { status: 400 });
    }

    const isValid = await bcrypt.compare(code, otpRecord.codeHash);

    if (!isValid) {
      await prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } }
      });
      return NextResponse.json({ error: `Incorrect OTP. ${2 - otpRecord.attempts} attempts remaining.` }, { status: 400 });
    }

    // Mark as used
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { usedAt: new Date() }
    });

    // If this was an email or phone verification during registration:
    if (type === "EMAIL_VERIFY") {
      await prisma.user.updateMany({
        where: { email: identifier },
        data: { emailVerified: new Date() }
      });
    }

    return NextResponse.json({ success: true, message: "Verification successful" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
