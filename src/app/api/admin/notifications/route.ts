import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "ADMIN", "STAFF"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [
      pendingOrders,
      unreadMessages,
      pendingCustomRequests,
      unresolvedErrors
    ] = await Promise.all([
      prisma.order.count({ where: { status: "PENDING" } }).catch(() => 0),
      prisma.contactMessage.count({ where: { isRead: false } }).catch(() => 0),
      prisma.customRequest.count({ where: { status: "PENDING" } }).catch(() => 0),
      // Only count system errors if role is SUPER_ADMIN
      session.user.role === "SUPER_ADMIN" 
        ? prisma.systemError.count({ where: { isResolved: false } }).catch(() => 0)
        : Promise.resolve(0)
    ]);

    return NextResponse.json({
      orders: pendingOrders,
      messages: unreadMessages,
      customRequests: pendingCustomRequests,
      systemErrors: unresolvedErrors
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
