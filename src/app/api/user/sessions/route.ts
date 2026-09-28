import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/user/sessions
 * Returns the user's active sessions (per device).
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessions = await prisma.userSession.findMany({
    where: {
      userId: session.user.id,
      expiresAt: { gt: new Date() },
    },
    orderBy: { lastActive: "desc" },
    select: {
      id: true,
      deviceInfo: true,
      ipAddress: true,
      location: true,
      lastActive: true,
      createdAt: true,
      expiresAt: true,
    }
  });

  return NextResponse.json(sessions);
}

/**
 * DELETE /api/user/sessions?id=<sessionId>
 * Revoke a specific session.
 */
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id === "all") {
    // Revoke ALL sessions
    await prisma.userSession.deleteMany({ where: { userId: session.user.id } });
    return NextResponse.json({ success: true, message: "All sessions revoked" });
  }

  if (!id) return NextResponse.json({ error: "Session ID required" }, { status: 400 });

  // Ensure user owns this session
  const target = await prisma.userSession.findFirst({
    where: { id, userId: session.user.id }
  });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.userSession.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
