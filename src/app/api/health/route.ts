import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/health
 * Public health check — used by uptime monitors (UptimeRobot, Railway, etc.)
 * Never expose internal error details in the response.
 */
export async function GET() {
  try {
    // Quick DB ping
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  } catch {
    // Return 503 but no internal details
    return NextResponse.json(
      { status: "degraded", timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}
