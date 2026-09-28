import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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

    return NextResponse.json(settingsObject);
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

    // Prepare operations to upsert every key-value pair
    const operations = Object.entries(body).map(([key, value]) => {
      const stringValue = typeof value === "object" || typeof value === "boolean" || typeof value === "number" 
        ? JSON.stringify(value) 
        : String(value);

      return prisma.setting.upsert({
        where: { key },
        update: { value: stringValue },
        create: { key, value: stringValue },
      });
    });

    // Execute in a transaction
    await prisma.$transaction(operations);

    return NextResponse.json({ success: true, message: "Settings saved successfully" });
  } catch (error) {
    console.error("POST Settings Error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
