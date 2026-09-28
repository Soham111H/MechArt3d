import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = updateSchema.parse(body);

    // Verify ownership
    const existingReq = await prisma.customRequest.findUnique({ where: { id: params.id } });
    if (!existingReq || existingReq.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    // Only allow update if currently QUOTED
    if (existingReq.status !== 'QUOTED') {
      return NextResponse.json({ error: "Can only respond to requests that have been quoted" }, { status: 400 });
    }

    const updated = await prisma.customRequest.update({
      where: { id: params.id },
      data: {
        status: data.status,
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.issues }, { status: 400 });
    }
    console.error("PUT User Custom Request Error:", error);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }
}
