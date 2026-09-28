import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page   = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit  = 10;
    const skip   = (page - 1) * limit;

    const ACTIVE_STATUSES = ['CONFIRMED', 'PRINTING', 'QUALITY_CHECK', 'PACKED', 'OUT_FOR_DELIVERY'];
    let statusFilter: any = {};
    if (status === 'PENDING')   statusFilter = { status: 'PENDING' };
    else if (status === 'ACTIVE')    statusFilter = { status: { in: ACTIVE_STATUSES } };
    else if (status === 'DELIVERED') statusFilter = { status: 'DELIVERED' };
    else if (status === 'CANCELLED') statusFilter = { status: 'CANCELLED' };

    const where = { userId: session.user.id, ...statusFilter };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          address: true,
          orderItems: {
            include: {
              product: { select: { name: true, slug: true, images: { take: 1, orderBy: { isPrimary: 'desc' } } } },
              variant: { select: { color: true, size: true } },
            },
          },
          statusHistory: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('GET User Orders Error:', error);
    return NextResponse.json({ error: 'Failed to fetch your orders' }, { status: 500 });
  }
}
