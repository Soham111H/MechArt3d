// src/app/api/admin/coupons/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  code: z.string().min(3).transform((v) => v.toUpperCase()).optional(),
  type: z.enum(["PERCENTAGE", "FIXED"]).optional(),
  value: z.number().positive().optional(),
  minOrderValue: z.number().nonnegative().optional(),
  maxUses: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().datetime({ offset: true }).nullable().optional(),
  isActive: z.boolean().optional(),
});

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

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const { code, type, value, minOrderValue, maxUses, expiresAt, isActive } = parsed.data;

    // Check duplicate code if changing
    if (code && code !== existing.code) {
      const dup = await prisma.coupon.findUnique({ where: { code } });
      if (dup) {
        return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
      }
    }

    const updateData: any = {};
    if (code !== undefined) updateData.code = code;
    if (type !== undefined) updateData.type = type;
    if (value !== undefined) updateData.value = value;
    if (minOrderValue !== undefined) updateData.minOrder = minOrderValue;
    if (maxUses !== undefined) updateData.maxUses = maxUses;
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updated = await prisma.coupon.update({
      where: { id },
      data: updateData,
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATED_COUPON",
        module: "COUPONS",
        details: { couponId: id, changes: updateData },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[Admin Coupons PATCH]", error);
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
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

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    await prisma.coupon.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "DELETED_COUPON",
        module: "COUPONS",
        details: { couponId: id, code: existing.code },
      },
    });

    return NextResponse.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("[Admin Coupons DELETE]", error);
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
