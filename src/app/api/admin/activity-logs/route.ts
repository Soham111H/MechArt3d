import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page    = parseInt(searchParams.get("page") ?? "1");
  const limit   = parseInt(searchParams.get("limit") ?? "50");
  const search  = searchParams.get("search") ?? "";
  const module_ = searchParams.get("module") ?? "";
  const format  = searchParams.get("format") ?? "json";

  const where: any = {};
  if (search) {
    where.OR = [
      { action:  { contains: search } },
      { module:  { contains: search } },
      { ipAddress: { contains: search } },
    ];
  }
  if (module_) where.module = module_;

  const [total, logs] = await Promise.all([
    prisma.activityLog.count({ where }),
    prisma.activityLog.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  // CSV export
  if (format === "csv") {
    const header = "ID,User,Email,Action,Module,IP,Date\n";
    const rows = logs.map(l =>
      `"${l.id}","${l.user?.name ?? ""}","${l.user?.email ?? ""}","${l.action}","${l.module}","${l.ipAddress ?? ""}","${l.createdAt.toISOString()}"`
    ).join("\n");

    return new NextResponse(header + rows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="activity-logs-${Date.now()}.csv"`,
      }
    });
  }

  return NextResponse.json({ logs, total, page, limit, pages: Math.ceil(total / limit) });
}
