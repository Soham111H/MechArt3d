import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "STAFF", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let whereClause: any = {};
    if (status) whereClause.status = status;
    if (search) {
      whereClause.OR = [
        { id: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, email: true } },
        address: true,
        orderItems: {
          include: {
            product: { select: { name: true, images: { take: 1 } } },
            variant: { select: { color: true, size: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET Admin Orders Error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
