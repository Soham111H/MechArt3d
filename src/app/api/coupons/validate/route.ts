import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({
  code:     z.string().min(1).max(50).toUpperCase(),
  subtotal: z.number().min(0),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body    = await req.json();
    const { code, subtotal } = schema.parse(body);

    const coupon = await prisma.coupon.findUnique({ where: { code } });
    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ valid: false, message: 'Invalid or inactive coupon code.' }, { status: 200 });
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return NextResponse.json({ valid: false, message: 'This coupon has expired.' });
    }

    if (coupon.minOrder && subtotal < Number(coupon.minOrder)) {
      return NextResponse.json({
        valid: false,
        message: `Minimum order of ₹${Number(coupon.minOrder).toLocaleString('en-IN')} required for this coupon.`,
      });
    }

    if (coupon.maxUses && coupon.usesCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, message: 'This coupon has reached its usage limit.' });
    }

    // Per-user limit check
    if (session?.user?.id && coupon.maxUsesPerUser) {
      const userOrders = await prisma.order.count({
        where: { userId: session.user.id, couponCode: code },
      });
      if (userOrders >= coupon.maxUsesPerUser) {
        return NextResponse.json({ valid: false, message: 'You have already used this coupon.' });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discountAmount = (subtotal * Number(coupon.value)) / 100;
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, Number(coupon.maxDiscount));
      }
    } else {
      discountAmount = Math.min(Number(coupon.value), subtotal);
    }

    return NextResponse.json({
      valid: true,
      discountAmount: Math.round(discountAmount * 100) / 100,
      type: coupon.type,
      value: Number(coupon.value),
      message: `Coupon applied! You save ₹${discountAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}.`,
    });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ valid: false, message: 'Invalid request.' }, { status: 400 });
    console.error('[coupon/validate]', err);
    return NextResponse.json({ valid: false, message: 'Something went wrong.' }, { status: 500 });
  }
}
