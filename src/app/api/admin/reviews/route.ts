// src/app/api/admin/reviews/route.ts
// NOTE: The Review model uses a `status` field (string: PENDING/APPROVED/REJECTED)
// instead of a boolean isApproved field. This route adapts accordingly.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const patchSchema = z.object({
  reviewId: z.string().min(1),
  isApproved: z.boolean(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "STAFF", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const approvedParam = searchParams.get("approved");

    const where: any = { deletedAt: null };
    if (approvedParam === "true") {
      where.status = "APPROVED";
    } else if (approvedParam === "false") {
      where.status = { not: "APPROVED" };
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("[Admin Reviews GET]", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "STAFF", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const { reviewId, isApproved } = parsed.data;

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const newStatus = isApproved ? "APPROVED" : "REJECTED";

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: { status: newStatus },
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true, slug: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: isApproved ? "APPROVED_REVIEW" : "REJECTED_REVIEW",
        module: "REVIEWS",
        details: { reviewId, productId: review.productId },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[Admin Reviews PATCH]", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}
