import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // Rate limiting — prevent bulk enumeration: 10 checks per minute per IP
    const ip = getClientIp(req);
    const limit = await rateLimit(`check-phone:${ip}`, 10, 60);
    if (!limit.allowed) {
      return NextResponse.json({ available: false, error: "Too many requests" }, { status: 429 });
    }

    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ available: false, error: "Phone number is required" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { phone },
      select: { id: true },
    });

    return NextResponse.json({ available: !user });
  } catch (error) {
    console.error("Check phone error:", error);
    return NextResponse.json({ available: false, error: "Internal server error" }, { status: 500 });
  }
}
