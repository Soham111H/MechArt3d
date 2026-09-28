import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rewards = await prisma.rewardPoint.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    });

    const totalPoints = rewards.reduce((sum: number, r: { points: number }) => sum + r.points, 0);

    return NextResponse.json({ rewards, totalPoints });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
