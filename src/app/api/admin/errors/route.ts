import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const errors = await prisma.systemError.findMany({
      orderBy: { createdAt: "desc" },
      take: 100, // Limit to 100 most recent for performance
    });

    return NextResponse.json(errors);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch errors" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id, isResolved } = await req.json();

    const updated = await prisma.systemError.update({
      where: { id },
      data: { isResolved },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update error" }, { status: 500 });
  }
}
