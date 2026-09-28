import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || !['ADMIN', 'SUPER_ADMIN', 'STAFF'].includes(session.user.role))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const { isActive } = await req.json();
  const sub = await prisma.newsletterSubscriber.update({ where: { id: params.id }, data: { isActive } });
  return NextResponse.json(sub);
}
