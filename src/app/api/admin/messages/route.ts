import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "STAFF", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("GET Messages Error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "STAFF", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { messageId, isRead } = body;

    if (!messageId || typeof isRead !== 'boolean') {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const message = await prisma.contactMessage.update({
      where: { id: messageId },
      data: { isRead }
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("PATCH Messages Error:", error);
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
  }
}
