import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { message, stackTrace, path } = await req.json();

    // Prevent massive spam of errors
    if (!message) return NextResponse.json({ success: false });

    await prisma.systemError.create({
      data: {
        message: message.substring(0, 5000), // Cap length
        stackTrace: stackTrace ? stackTrace.substring(0, 10000) : null,
        path: path ? path.substring(0, 500) : null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to log system error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
