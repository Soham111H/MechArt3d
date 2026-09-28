import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "STAFF" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const data = categorySchema.parse(body);

    const category = await prisma.category.update({
      where: { id: params.id },
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
        action: "UPDATED_CATEGORY",
        module: "CATEGORIES",
        details: { categoryId: category.id, name: category.name }
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data provided", details: error.issues }, { status: 400 });
    }
    console.error("PUT Category Error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    // Only Super Admin can delete
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Only Super Admin can delete categories" }, { status: 403 });
    }

    // Soft delete
    await prisma.category.update({
      where: { id: params.id },
      data: { deletedAt: new Date() }
    });

    // Log action
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "DELETED_CATEGORY",
        module: "CATEGORIES",
        details: { categoryId: params.id }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Category Error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
