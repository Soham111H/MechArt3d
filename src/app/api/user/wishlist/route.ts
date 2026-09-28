import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET — fetch user's wishlist
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const items = await prisma.wishlist.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            images: { take: 1, orderBy: { isPrimary: 'desc' } },
            category: { select: { name: true } },
          },
        },
      },
      orderBy: { addedAt: 'desc' },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('GET Wishlist Error:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

// POST — toggle wishlist (add if not exists, remove if exists)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { productId } = await req.json();
    if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 });

    const existing = await prisma.wishlist.findFirst({
      where: { userId: session.user.id, productId },
    });

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return NextResponse.json({ wishlisted: false });
    } else {
      await prisma.wishlist.create({ data: { userId: session.user.id, productId } });
      return NextResponse.json({ wishlisted: true });
    }
  } catch (error) {
    console.error('POST Wishlist Error:', error);
    return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 });
  }
}

// DELETE — remove specific item
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 });

    await prisma.wishlist.deleteMany({ where: { userId: session.user.id, productId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE Wishlist Error:', error);
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}
