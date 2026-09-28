import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const tiers = await prisma.tieredPricingRule.findMany({
      where: { OR: [{ productId: params.slug }, { productId: null }] },
      orderBy: { minQty: 'asc' },
    });
    return NextResponse.json(tiers);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
