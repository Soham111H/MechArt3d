// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const patchSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN", "STAFF"]).optional(),
  banned: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "STAFF", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        deletedAt: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("[Admin Users GET]", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "STAFF", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const { userId, role, banned } = parsed.data;

    // Only SUPER_ADMIN can change roles
    if (role !== undefined && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Only SUPER_ADMIN can change roles" }, { status: 403 });
    }

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (banned !== undefined) {
      // SECURITY: STAFF/ADMIN cannot ban SUPER_ADMIN or ADMIN accounts — only SUPER_ADMIN can
      if (banned && ['ADMIN', 'SUPER_ADMIN'].includes(target.role) && session.user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: "Only SUPER_ADMIN can ban admin accounts" }, { status: 403 });
      }
      updateData.deletedAt = banned ? new Date() : null;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, deletedAt: true },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: role !== undefined ? "UPDATED_USER_ROLE" : "TOGGLED_USER_BAN",
        module: "USERS",
        details: { targetUserId: userId, changes: updateData },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[Admin Users PATCH]", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
