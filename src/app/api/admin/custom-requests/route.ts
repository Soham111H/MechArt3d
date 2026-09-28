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
    const type   = searchParams.get("type");

    const whereClause: any = {};
    if (status && status !== "ALL") whereClause.status      = status;
    if (type   && type   !== "ALL") whereClause.requestType = type;


    const requests = await prisma.customRequest.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("GET Admin Custom Requests Error:", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}
