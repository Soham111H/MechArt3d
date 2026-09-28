// src/app/api/admin/blog/route.ts
// NOTE: BlogPost schema uses tagsJson (Json?) field, not a tags String[].
// excerpt is not a separate field in schema; content serves as main body.
// This route handles tagsJson and a virtual excerpt via content slicing if needed.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(5),
  slug: z.string().min(3),
  content: z.string().min(10),
  excerpt: z.string().optional(),
  coverImage: z.string().url().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "STAFF", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const posts = await prisma.blogPost.findMany({
      where: { deletedAt: null },
      include: {
        author: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("[Admin Blog GET]", error);
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "STAFF", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const { title, slug, content, coverImage, status, tags, category } = parsed.data;

    // Check for duplicate slug
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        coverImage: coverImage ?? null,
        status,
        tagsJson: tags ? tags : [],
        category: category ?? null,
        authorId: session.user.id,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
      include: {
        author: { select: { name: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "CREATED_BLOG_POST",
        module: "BLOG",
        details: { postId: post.id, title, slug },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("[Admin Blog POST]", error);
    return NextResponse.json({ error: "Failed to create blog post" }, { status: 500 });
  }
}
