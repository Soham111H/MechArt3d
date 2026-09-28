// src/app/api/auth/link-google/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password, token } = await req.json();

    if (!email || !password || !token) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Find the pending link record
    const pendingRecord = await prisma.otpCode.findFirst({
      where: {
        identifier: normalizedEmail,
        type:       "GOOGLE_LINK_PENDING",
        usedAt:     null,
        expiresAt:  { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!pendingRecord) {
      return NextResponse.json(
        { error: "Link session expired. Please try signing in with Google again." },
        { status: 400 }
      );
    }

    // 2. Parse the stored Google account data
    let pendingData: any;
    try {
      pendingData = JSON.parse(pendingRecord.codeHash);
    } catch {
      return NextResponse.json({ error: "Invalid session data." }, { status: 400 });
    }

    // 3. Verify the token matches
    if (pendingData.token !== token) {
      return NextResponse.json({ error: "Invalid or expired link token." }, { status: 400 });
    }

    // 4. Find and verify the existing user's password
    const user = await prisma.user.findUnique({
      where:   { email: normalizedEmail },
      include: { accounts: { where: { provider: "google" } } },
    });

    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    if (!user.passwordHash) {
      return NextResponse.json({ error: "No password set on this account." }, { status: 400 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Incorrect password. Please try again." }, { status: 401 });
    }

    // 5. Check if already linked (race condition guard)
    if (user.accounts.length > 0) {
      // Already linked — mark token as used and tell client to sign in normally
      await prisma.otpCode.update({
        where: { id: pendingRecord.id },
        data:  { usedAt: new Date() },
      });
      return NextResponse.json({ success: true, alreadyLinked: true });
    }

    // 6. Link the Google account + update avatar atomically
    await prisma.$transaction([
      prisma.account.create({
        data: {
          userId:            user.id,
          type:              "oauth",
          provider:          "google",
          providerAccountId: pendingData.providerAccountId,
          access_token:      pendingData.access_token,
          refresh_token:     pendingData.refresh_token,
          expires_at:        pendingData.expires_at,
          token_type:        pendingData.token_type,
          scope:             pendingData.scope,
          id_token:          pendingData.id_token,
        },
      }),
      // Mark pending token as used
      prisma.otpCode.update({
        where: { id: pendingRecord.id },
        data:  { usedAt: new Date() },
      }),
    ]);

    // Update avatar from Google if not set
    if (!user.avatar && pendingData.googleImage) {
      await prisma.user.update({
        where: { id: user.id },
        data:  { avatar: pendingData.googleImage },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Google account linked successfully! Signing you in…",
    });

  } catch (error) {
    console.error("[link-google] Error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
