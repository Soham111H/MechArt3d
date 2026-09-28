import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { navStructure } from "@/config/nav";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim().toLowerCase();

    if (!query) {
      return NextResponse.json({ products: [], pages: [] });
    }

    // 1. Search Database Products
    const products = await prisma.product.findMany({
      where: {
        AND: [
          { isActive: true },
          { status: "PUBLISHED" },
          { deletedAt: null },
          {
            OR: [
              { name: { contains: query } },
              { description: { contains: query } },
              { slug: { contains: query } },
            ],
          },
        ],
      },
      take: 5,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
      },
    });

    const formattedProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.basePrice),
      image: p.images[0]?.url || null,
      type: "product"
    }));

    // 2. Search Nav Structure (Static pages, applications, resources)
    const pages: any[] = [];
    navStructure.forEach((navItem) => {
      // Check top level
      if (navItem.label.toLowerCase().includes(query)) {
        pages.push({ label: navItem.label, href: navItem.href, type: "page" });
      }
      // Check children
      if (navItem.items && Array.isArray(navItem.items)) {
        navItem.items.forEach((subItem: any) => {
          if (
            subItem.label.toLowerCase().includes(query) ||
            (subItem.description && subItem.description.toLowerCase().includes(query))
          ) {
            pages.push({ 
              label: subItem.label, 
              href: subItem.href, 
              description: subItem.description || "",
              type: "page"
            });
          }
        });
      }
    });

    // Remove duplicates from pages based on href and limit to 5
    const uniquePages = Array.from(new Map(pages.map(item => [item.href, item])).values()).slice(0, 5);

    return NextResponse.json({ products: formattedProducts, pages: uniquePages });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 });
  }
}
