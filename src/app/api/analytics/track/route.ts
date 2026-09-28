import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { path, ip, userAgent } = await req.json();
    if (!path) return NextResponse.json({ error: "No path" }, { status: 400 });

    await prisma.pageVisit.create({
      data: {
        path,
        ip,
        userAgent,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to track visit" }, { status: 500 });
  }
}
