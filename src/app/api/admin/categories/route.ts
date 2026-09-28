import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  parentId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "STAFF" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const categories = await prisma.category.findMany({
      where: { deletedAt: null },
      include: {
        _count: { select: { products: true } },
        parent: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET Categories Error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "STAFF" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const data = categorySchema.parse(body);

    const existing = await prisma.category.findUnique({
      where: { slug: data.slug }
    });

    if (existing) {
      return NextResponse.json({ error: "A category with this slug already exists" }, { status: 409 });
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        imageUrl: data.imageUrl,
        parentId: data.parentId || null,
      }
    });

    // Log action
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "CREATED_CATEGORY",
        module: "CATEGORIES",
        details: { categoryId: category.id, name: category.name }
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data provided", details: error.issues }, { status: 400 });
    }
    console.error("POST Category Error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
