import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !['ADMIN', 'SUPER_ADMIN', 'STAFF'].includes(session.user.role))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const subs = await prisma.newsletterSubscriber.findMany({ orderBy: { subscribedAt: 'desc' } });
  return NextResponse.json(subs);
}
