import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({
  title:       z.string().min(2).max(255).optional(),
  discountPct: z.coerce.number().min(0.1).max(99).optional(),
  startsAt:    z.string().transform(s => new Date(s)).optional(),
  endsAt:      z.string().transform(s => new Date(s)).optional(),
  isActive:    z.boolean().optional(),
});

async function requireAdmin() {
  const session = await auth();
  if (!session || !['ADMIN', 'SUPER_ADMIN', 'STAFF'].includes(session.user.role))
    throw new Error('Unauthorized');
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const data = schema.parse(await req.json());
    const sale = await prisma.flashSale.update({ where: { id: params.id }, data });
    return NextResponse.json(sale);
  } catch (e: any) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    if (e.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await prisma.flashSale.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
