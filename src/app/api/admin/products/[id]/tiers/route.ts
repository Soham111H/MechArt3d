import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const tierSchema = z.object({
  minQty:      z.number().int().min(1),
  maxQty:      z.number().int().nullable().optional(),
  discountPct: z.number().min(0).max(100),
});

const bulkSchema = z.array(tierSchema);

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || !['ADMIN', 'SUPER_ADMIN', 'STAFF'].includes(session.user.role))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const tiers = await prisma.tieredPricingRule.findMany({
    where: { productId: params.id },
    orderBy: { minQty: 'asc' },
  });
  return NextResponse.json(tiers);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || !['ADMIN', 'SUPER_ADMIN', 'STAFF'].includes(session.user.role))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const body  = await req.json();
    const tiers = bulkSchema.parse(body);

    await prisma.$transaction([
      prisma.tieredPricingRule.deleteMany({ where: { productId: params.id } }),
      ...tiers.map(t => prisma.tieredPricingRule.create({
        data: { productId: params.id, minQty: t.minQty, maxQty: t.maxQty ?? null, discountPct: t.discountPct },
      })),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Invalid data', details: err.issues }, { status: 400 });
    return NextResponse.json({ error: 'Failed to save tiers' }, { status: 500 });
  }
}
