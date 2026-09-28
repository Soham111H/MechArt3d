import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomInt } from "crypto";
import bcrypt from "bcryptjs";

// Generates a cryptographically secure 6-digit OTP
const generateOTP = () => randomInt(100000, 1000000).toString();

export async function POST(req: NextRequest) {
  try {
    const { identifier, type } = await req.json(); // identifier = phone/email

    if (!identifier || !type) {
      return NextResponse.json({ error: "Identifier and type are required" }, { status: 400 });
    }

    // Rate limiting: check how many OTPs sent recently
    const recentOtps = await prisma.otpCode.count({
      where: {
        identifier,
        createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) } // Last 10 minutes
      }
    });

    if (recentOtps >= 3) {
      return NextResponse.json({ error: "Too many attempts. Try again in 10 minutes." }, { status: 429 });
    }

    const code = generateOTP();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.otpCode.create({
      data: {
        identifier,
        type,
        codeHash,
        expiresAt,
      }
    });

    // NOTE: In production integrate with Twilio/MSG91/NodeMailer — NEVER log the plaintext OTP
    console.log(`[OTP] Code created for ${identifier} (type: ${type}) — code NOT logged for security`);

    return NextResponse.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
