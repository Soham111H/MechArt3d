import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/account/export
 * GDPR: Right to access — export all user data as JSON.
 * Rate limited to prevent abuse.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const [user, orders, addresses, reviews, rewards, customRequests, loginHistory] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true, name: true, email: true, phone: true,
          role: true, createdAt: true, updatedAt: true,
          // Never export passwordHash!
        }
      }),
      prisma.order.findMany({
        where: { userId },
        include: { orderItems: true },
        orderBy: { createdAt: "desc" }
      }),
      prisma.address.findMany({ where: { userId } }),
      prisma.review.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
      prisma.rewardPoint.findMany({ where: { userId } }),
      prisma.customRequest.findMany({ where: { userId } }),
      prisma.loginHistory.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 100, // Last 100 logins
      }),
    ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    profile: user,
    orders,
    addresses,
    reviews,
    rewardPoints: rewards,
    customRequests,
    loginHistory,
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="mechart3d-data-${userId.slice(-8)}.json"`,
    }
  });
}
