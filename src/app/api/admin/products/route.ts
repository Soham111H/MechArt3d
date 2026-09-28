import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { logAdminAction } from "@/lib/security/security-log";
import { getClientIp } from "@/lib/security/rate-limit";
import { sanitizeObject } from "@/lib/security/sanitize";

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string(),
  categoryId: z.string(),
  basePrice: z.number().min(0),
  discountPrice: z.number().optional().nullable(),
  stock: z.number().int().min(0),
  material: z.string().optional().nullable(),
  isCustom: z.boolean().default(false),
  status: z.string().default("PUBLISHED"),
  images: z.array(z.string()).optional(),
  models: z.array(z.string()).optional(),
  variants: z.array(z.object({
    color: z.string(),
    stock: z.number().int().min(0),
    priceModifier: z.number().min(0)
  })).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "STAFF", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: search } },
          { slug: { contains: search } }
        ]
      },
      include: {
        category: { select: { name: true } },
        images: true,
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET Products Error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "STAFF", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const sanitizedBody = sanitizeObject(body);
    const data = productSchema.parse(sanitizedBody);

    const existing = await prisma.product.findUnique({
      where: { slug: data.slug }
    });

    if (existing) {
      return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });
    }

    // Use transaction to create product + images + models safely
    const product = await prisma.$transaction(async (tx) => {
      const p = await tx.product.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          categoryId: data.categoryId,
          basePrice: data.basePrice,
          discountPrice: data.discountPrice,
          stock: data.stock,
          material: data.material,
          isCustom: data.isCustom,
          status: data.status,
          isActive: data.status === 'PUBLISHED',
        }
      });

      if (data.images && data.images.length > 0) {
        await tx.productImage.createMany({
          data: data.images.map((url, i) => ({
            productId: p.id,
            url,
            isPrimary: i === 0,
            sortOrder: i,
          }))
        });
      }

      if (data.models && data.models.length > 0) {
        await tx.product3DModel.createMany({
          data: data.models.map(url => ({
            productId: p.id,
            modelUrl: url,
            format: url.endsWith('.obj') ? 'obj' : 'glb'
          }))
        });
      }

      if (data.variants && data.variants.length > 0) {
        await tx.variant.createMany({
          data: data.variants.map((v) => ({
            productId: p.id,
            color: v.color,
            stock: v.stock,
            priceModifier: v.priceModifier
          }))
        });
      }

      return p;
    });

    await logAdminAction(
      session.user.id,
      "CREATED_PRODUCT",
      "PRODUCTS",
      { productId: product.id, name: product.name },
      getClientIp(req)
    );

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data provided", details: error.issues }, { status: 400 });
    }
    console.error("POST Product Error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
