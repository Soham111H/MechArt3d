import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("category");
    const material = searchParams.get("material");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "newest";

    let whereClause: any = {
      isActive: true,
      status: "PUBLISHED",
      deletedAt: null,
      OR: search ? [
        { name: { contains: search } },
        { description: { contains: search } }
      ] : undefined,
    };

    if (categoryId) whereClause.categoryId = categoryId;
    if (material) whereClause.material = material;
    
    if (minPrice || maxPrice) {
      whereClause.basePrice = {};
      if (minPrice) whereClause.basePrice.gte = parseFloat(minPrice);
      if (maxPrice) whereClause.basePrice.lte = parseFloat(maxPrice);
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price-asc") orderBy = { basePrice: "asc" };
    if (sort === "price-desc") orderBy = { basePrice: "desc" };
    if (sort === "popular") orderBy = { orderItems: { _count: "desc" } };

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: { select: { name: true, slug: true } },
        images: {
          where: { isPrimary: true },
          take: 1
        },
        flashSales: {
          where: { 
            isActive: true,
            startsAt: { lte: new Date() },
            endsAt: { gte: new Date() }
          },
          take: 1,
        }
      },
      orderBy,
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET Public Products Error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
