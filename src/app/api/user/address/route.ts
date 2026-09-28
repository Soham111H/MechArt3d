import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(addresses);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();

    // If setting as default, unset others first
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false }
      });
    }

    // Check if this is the first address, if so make it default automatically
    const count = await prisma.address.count({ where: { userId: session.user.id } });
    const shouldBeDefault = count === 0 || data.isDefault;

    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
        label: data.label || "Home",
        line1: data.line1,
        line2: data.line2 || "",
        city: data.city,
        state: data.state,
        country: data.country || "India",
        pincode: data.pincode,
        isDefault: shouldBeDefault,
      }
    });

    return NextResponse.json(address);
  } catch (error) {
    console.error("POST Address Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "Address ID required" }, { status: 400 });

    await prisma.address.delete({
      where: { id, userId: session.user.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.update({
      where: { id: data.id, userId: session.user.id },
      data: {
        label: data.label,
        line1: data.line1,
        line2: data.line2,
        city: data.city,
        state: data.state,
        country: data.country,
        pincode: data.pincode,
        isDefault: data.isDefault,
      }
    });

    return NextResponse.json(address);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
