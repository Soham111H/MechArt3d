import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug;
    if (!slug) return NextResponse.json({ error: "Slug required" }, { status: 400 });

    const product = await prisma.product.findFirst({
      where: {
        slug: slug,
        isActive: true,
        status: "PUBLISHED",
        deletedAt: null,
      },
      include: {
        category: { select: { name: true, slug: true } },
        images: { orderBy: { sortOrder: "asc" } },
        models: true,
        variants: true,
        reviews: {
          where: { status: "APPROVED" },
          include: { user: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: "desc" },
          take: 5
        },
        tieredPricing: { orderBy: { minQty: 'asc' } },
        flashSales: {
          where: { isActive: true, startsAt: { lte: new Date() }, endsAt: { gte: new Date() } },
          take: 1
        }
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const reviewStats = await prisma.review.aggregate({
      where: { productId: product.id, status: "APPROVED" },
      _avg: { rating: true },
      _count: { id: true },
    });

    return NextResponse.json({
      ...product,
      averageRating: reviewStats._avg.rating || 0,
      totalReviews: reviewStats._count.id || 0,
    });
  } catch (error) {
    console.error("GET Product Detail Error:", error);
    return NextResponse.json({ error: "Failed to fetch product details" }, { status: 500 });
  }
}
