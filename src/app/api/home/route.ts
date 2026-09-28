import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const dbProducts = await prisma.product.findMany({
      where: { isActive: true, status: "PUBLISHED", deletedAt: null },
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        reviews: { where: { status: "APPROVED" } }
      }
    });

    const products = dbProducts.map(p => {
      const avgRating = p.reviews.length > 0 ? p.reviews.reduce((acc, r) => acc + r.rating, 0) / p.reviews.length : 0;
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.basePrice),
        originalPrice: null, // or calculate discount if applicable
        rating: avgRating,
        reviews: p.reviews.length,
        material: "PLA", // default or mapped from category
        image: p.images[0]?.url || null,
        badge: "New",
      };
    });

    const dbReviews = await prisma.review.findMany({
      where: { status: "APPROVED", rating: { gte: 4 } },
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } }
      }
    });

    const testimonials = dbReviews.map(r => ({
      name: r.user?.name || "Anonymous",
      role: "Verified Customer",
      text: r.body,
      rating: r.rating,
      avatar: (r.user?.name || "A").substring(0, 2).toUpperCase(),
    }));

    return NextResponse.json({ products, testimonials });
  } catch (error) {
    console.error("Home API Error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
