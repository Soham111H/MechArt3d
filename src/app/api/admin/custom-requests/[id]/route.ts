import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWING', 'QUOTED', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED']),
  quotedPrice: z.number().optional().nullable(),
  adminNotes: z.string().optional().nullable(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "STAFF", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const data = updateSchema.parse(body);

    const updated = await prisma.customRequest.update({
      where: { id: params.id },
      data: {
        status: data.status,
        quotedPrice: data.quotedPrice,
        adminNotes: data.adminNotes,
        assignedStaffId: session.user.id,
      }
    });

    if (updated.userId) {
      await prisma.notification.create({
        data: {
          userId: updated.userId,
          type: "SYSTEM",
          title: "Custom Request Updated",
          message: `Your custom request for "${updated.title}" is now ${data.status.replace(/_/g, ' ')}.${data.quotedPrice ? ` Quote: ₹${data.quotedPrice}` : ''}`,
          link: "/custom-design", // or wherever user sees their requests
        }
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.issues }, { status: 400 });
    }
    console.error("PUT Admin Custom Request Error:", error);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }
}
