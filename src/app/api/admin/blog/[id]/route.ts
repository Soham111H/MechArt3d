// src/app/api/admin/blog/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(5).optional(),
  slug: z.string().min(3).optional(),
  content: z.string().min(10).optional(),
  excerpt: z.string().optional(),
  coverImage: z.string().url().nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().nullable().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "STAFF", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;

    const post = await prisma.blogPost.findFirst({
      where: { id, deletedAt: null },
      include: {
        author: { select: { name: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("[Admin Blog GET by id]", error);
    return NextResponse.json({ error: "Failed to fetch blog post" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "STAFF", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;

    const existing = await prisma.blogPost.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const { title, slug, content, coverImage, status, tags, category } = parsed.data;

    // Check slug uniqueness if changing
    if (slug && slug !== existing.slug) {
      const dup = await prisma.blogPost.findUnique({ where: { slug } });
      if (dup) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
      }
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (content !== undefined) updateData.content = content;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tagsJson = tags;
    if (status !== undefined) {
      updateData.status = status;
      // Set publishedAt when first publishing
      if (status === "PUBLISHED" && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      } else if (status === "DRAFT") {
        updateData.publishedAt = null;
      }
    }

    const updated = await prisma.blogPost.update({
      where: { id },
      data: updateData,
      include: {
        author: { select: { name: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATED_BLOG_POST",
        module: "BLOG",
        details: { postId: id, changes: Object.keys(updateData) },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[Admin Blog PATCH]", error);
    return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "STAFF", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;

    const existing = await prisma.blogPost.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    // Soft delete
    await prisma.blogPost.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "DELETED_BLOG_POST",
        module: "BLOG",
        details: { postId: id, title: existing.title },
      },
    });

    return NextResponse.json({ message: "Blog post deleted successfully" });
  } catch (error) {
    console.error("[Admin Blog DELETE]", error);
    return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
  }
}
