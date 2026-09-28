import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: "Invalid password requirements" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "User not found or uses OAuth" }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash }
      }),
      prisma.passwordHistory.create({
        data: {
          userId: user.id,
          passwordHash: newHash
        }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Change Password Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
