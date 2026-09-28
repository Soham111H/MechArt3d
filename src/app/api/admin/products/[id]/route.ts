import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { logAdminAction } from "@/lib/security/security-log";
import { getClientIp } from "@/lib/security/rate-limit";
import { sanitizeObject } from "@/lib/security/sanitize";

const updateSchema = z.object({
  name:          z.string().min(2).optional(),
  slug:          z.string().min(2).optional(),
  description:   z.string().optional(),
  categoryId:    z.string().optional(),
  basePrice:     z.number().min(0).optional(),
  discountPrice: z.number().nullable().optional(),
  stock:         z.number().int().min(0).optional(),
  material:      z.string().nullable().optional(),
  isCustom:      z.boolean().optional(),
  status:        z.string().optional(),
  images:        z.array(z.string()).optional(),
  variants:      z.array(z.object({
    color: z.string(),
    stock: z.number().int().min(0),
    priceModifier: z.number().min(0)
  })).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "STAFF", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: { select: { id: true, name: true } },
        images:   true,
        variants: true,
      },
    });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    console.error("GET Product[id] Error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
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

    const body = await req.json();
    const sanitizedBody = sanitizeObject(body);
    const data = updateSchema.parse(sanitizedBody);

    // Build update payload (only include defined fields)
    const updateData: Record<string, unknown> = {};
    if (data.name          !== undefined) updateData.name          = data.name;
    if (data.slug          !== undefined) updateData.slug          = data.slug;
    if (data.description   !== undefined) updateData.description   = data.description;
    if (data.categoryId    !== undefined) updateData.categoryId    = data.categoryId;
    if (data.basePrice     !== undefined) updateData.basePrice     = data.basePrice;
    if (data.discountPrice !== undefined) updateData.discountPrice = data.discountPrice;
    if (data.stock         !== undefined) updateData.stock         = data.stock;
    if (data.material      !== undefined) updateData.material      = data.material;
    if (data.isCustom      !== undefined) updateData.isCustom      = data.isCustom;
    if (data.status        !== undefined) {
      updateData.status   = data.status;
      updateData.isActive = data.status === "PUBLISHED";
    }

    const product = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id: params.id },
        data:  updateData,
      });

      // Replace images if provided
      if (data.images) {
        await tx.productImage.deleteMany({ where: { productId: params.id } });
        if (data.images.length > 0) {
          await tx.productImage.createMany({
            data: data.images.map((url, i) => ({
              productId: params.id,
              url,
              isPrimary: i === 0,
              sortOrder: i,
            })),
          });
        }
      }

      if (data.variants) {
        await tx.variant.deleteMany({ where: { productId: params.id } });
        if (data.variants.length > 0) {
          await tx.variant.createMany({
            data: data.variants.map((v) => ({
              productId: params.id,
              color: v.color,
              stock: v.stock,
              priceModifier: v.priceModifier
            }))
          });
        }
      }

      return updated;
    });

    await logAdminAction(
      session.user.id,
      "UPDATED_PRODUCT",
      "PRODUCTS",
      { productId: product.id, name: product.name },
      getClientIp(req)
    );

    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.issues }, { status: 400 });
    }
    console.error("PATCH Product[id] Error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    // Only Super Admin can delete
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Only Super Admin can delete products" }, { status: 403 });
    }

    // Soft delete
    await prisma.product.update({
      where: { id: params.id },
      data: { deletedAt: new Date(), isActive: false, status: 'ARCHIVED' }
    });

    await logAdminAction(
      session.user.id,
      "DELETED_PRODUCT",
      "PRODUCTS",
      { productId: params.id },
      getClientIp(req)
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Product Error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
