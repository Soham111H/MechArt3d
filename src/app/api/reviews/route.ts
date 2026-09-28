import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(255).optional(),
  body: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = reviewSchema.parse(body);

    // Verify if user already reviewed this product
    const existing = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        productId: data.productId,
      }
    });

    if (existing) {
      return NextResponse.json({ error: "You have already reviewed this product." }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId: data.productId,
        rating: data.rating,
        title: data.title,
        body: data.body,
        status: "PENDING",
      }
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data provided", details: error.issues }, { status: 400 });
    }
    console.error("POST Review Error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
