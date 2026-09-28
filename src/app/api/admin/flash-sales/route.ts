import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({
  title:       z.string().min(2).max(255),
  discountPct: z.coerce.number().min(0.1).max(99),
  startsAt:    z.string().transform(s => new Date(s)),
  endsAt:      z.string().transform(s => new Date(s)),
  isActive:    z.boolean().default(true),
});

async function requireAdmin(req: NextRequest) {
  const session = await auth();
  if (!session || !['ADMIN', 'SUPER_ADMIN', 'STAFF'].includes(session.user.role))
    throw new Error('Unauthorized');
  return session;
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const sales = await prisma.flashSale.findMany({ orderBy: { startsAt: 'desc' } });
    return NextResponse.json(sales);
  } catch (e: any) {
    if (e.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const data = schema.parse(await req.json());
    const sale = await prisma.flashSale.create({ data });
    return NextResponse.json(sale, { status: 201 });
  } catch (e: any) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: 'Invalid data', details: e.issues }, { status: 400 });
    if (e.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
