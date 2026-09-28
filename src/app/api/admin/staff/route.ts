// src/app/api/admin/staff/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const createSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(["STAFF", "ADMIN"]),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "STAFF", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const staff = await prisma.user.findMany({
      where: {
        role: { in: ["ADMIN", "SUPER_ADMIN", "STAFF"] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("[Admin Staff GET]", error);
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Only SUPER_ADMIN can create staff members" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const { email, name, role } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    let user;
    if (existingUser) {
      // Update existing user to staff role
      user = await prisma.user.update({
        where: { email: normalizedEmail },
        data: { role, deletedAt: null },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      });

      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: "PROMOTED_USER_TO_STAFF",
          module: "STAFF",
          details: { targetUserId: existingUser.id, newRole: role },
        },
      });
    } else {
      // Create new user with random temp password
      const tempPassword = crypto.randomBytes(12).toString("hex");
      const passwordHash = await bcrypt.hash(tempPassword, 12);

      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name,
          role,
          passwordHash,
        },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      });

      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: "CREATED_STAFF_MEMBER",
          module: "STAFF",
          details: { newUserId: user.id, email: normalizedEmail, role },
        },
      });
    }

    return NextResponse.json(user, { status: existingUser ? 200 : 201 });
  } catch (error) {
    console.error("[Admin Staff POST]", error);
    return NextResponse.json({ error: "Failed to create/update staff member" }, { status: 500 });
  }
}
