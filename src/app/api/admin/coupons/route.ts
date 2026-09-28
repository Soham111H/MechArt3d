// src/app/api/admin/coupons/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createSchema = z.object({
  code: z.string().min(3).transform((v) => v.toUpperCase()),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().positive(),
  minOrderValue: z.number().nonnegative().optional(),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.string().datetime({ offset: true }).optional(),
  isActive: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "STAFF", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(coupons);
  } catch (error) {
    console.error("[Admin Coupons GET]", error);
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
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

    const { code, type, value, minOrderValue, maxUses, expiresAt, isActive } = parsed.data;

    // Check for duplicate code
    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        type,
        value,
        minOrder: minOrderValue ?? null,
        maxUses: maxUses ?? null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "CREATED_COUPON",
        module: "COUPONS",
        details: { couponId: coupon.id, code },
      },
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error("[Admin Coupons POST]", error);
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}
