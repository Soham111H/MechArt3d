import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const settings = await prisma.setting.findMany({
      where: { key: { in: ["MAINTENANCE_MODE", "DISABLED_ROUTES"] } },
    });

    const config = {
      maintenanceMode: false,
      disabledRoutes: [] as string[],
    };

    settings.forEach((s) => {
      if (s.key === "MAINTENANCE_MODE") config.maintenanceMode = s.value === "true";
      if (s.key === "DISABLED_ROUTES") {
        try { config.disabledRoutes = JSON.parse(s.value); } catch (e) {}
      }
    });

    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { maintenanceMode, disabledRoutes } = body;

    // Transaction to update both settings
    await prisma.$transaction([
      prisma.setting.upsert({
        where: { key: "MAINTENANCE_MODE" },
        update: { value: maintenanceMode ? "true" : "false" },
        create: { key: "MAINTENANCE_MODE", value: maintenanceMode ? "true" : "false" },
      }),
      prisma.setting.upsert({
        where: { key: "DISABLED_ROUTES" },
        update: { value: JSON.stringify(disabledRoutes || []) },
        create: { key: "DISABLED_ROUTES", value: JSON.stringify(disabledRoutes || []) },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
