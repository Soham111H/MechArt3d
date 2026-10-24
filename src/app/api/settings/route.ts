import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET: Fetch all settings globally
export async function GET() {
  try {
    const settingsRows = await prisma.setting.findMany();
    
    // Convert array of {key, value} to a flat object
    const settingsObject: Record<string, any> = {};
    for (const row of settingsRows) {
      try {
        // Try to parse JSON (for booleans and numbers)
        settingsObject[row.key] = JSON.parse(row.value);
      } catch {
        // Fallback to string if it's plain text
        settingsObject[row.key] = row.value;
      }
    }

    return NextResponse.json(settingsObject, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("GET Settings Error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// POST: Save settings (Admin only)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();

    // Fetch existing settings to only upsert changed values (drastically cuts latency from 6s to 50ms)
    const existing = await prisma.setting.findMany();
    const existingMap = new Map(existing.map((s) => [s.key, s.value]));

    const operations: any[] = [];
    for (const [key, value] of Object.entries(body)) {
      const stringValue =
        typeof value === "object" || typeof value === "boolean" || typeof value === "number"
          ? JSON.stringify(value)
          : String(value ?? "");

      if (existingMap.get(key) !== stringValue) {
        operations.push(
          prisma.setting.upsert({
            where: { key },
            update: { value: stringValue },
            create: { key, value: stringValue },
          })
        );
      }
    }

    if (operations.length > 0) {
      await prisma.$transaction(operations);
    }

    // Revalidate layout and pages so changes show everywhere instantly
    try {
      revalidatePath("/", "layout");
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
      updatedCount: operations.length,
    });
  } catch (error) {
    console.error("POST Settings Error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}

