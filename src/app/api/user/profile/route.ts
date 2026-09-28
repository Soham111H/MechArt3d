import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET Profile Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone, avatar } = await req.json();

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, phone, avatar },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("PUT Profile Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
