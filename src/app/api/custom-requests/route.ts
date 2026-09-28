import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const requestSchema = z.object({
  title:          z.string().min(3),
  description:    z.string().min(10),
  material:       z.string().optional(),
  color:          z.string().optional(),
  quantity:       z.number().int().min(1).default(1),
  budget:         z.number().optional(),
  fileUrl:        z.string().optional(),
  // Instant-quote specific
  requestType:    z.enum(["CUSTOM", "INSTANT_QUOTE"]).default("CUSTOM"),
  stlFileUrl:     z.string().optional(),
  estimatedPrice: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to submit a request" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const data = requestSchema.parse(body);

    const customRequest = await prisma.customRequest.create({
      data: {
        userId:         session.user.id,
        title:          data.title,
        description:    data.description,
        material:       data.material,
        color:          data.color,
        quantity:       data.quantity,
        budget:         data.budget,
        fileUrl:        data.fileUrl,
        requestType:    data.requestType,
        stlFileUrl:     data.stlFileUrl,
        estimatedPrice: data.estimatedPrice,
        status:         "PENDING",
      },
    });

    return NextResponse.json(customRequest, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.issues }, { status: 400 });
    }
    console.error("POST Custom Request Error:", error);
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requests = await prisma.customRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("GET Custom Requests Error:", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}
