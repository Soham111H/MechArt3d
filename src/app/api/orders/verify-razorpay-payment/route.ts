import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // SECURITY: Require authentication — unauthenticated callers cannot verify payments
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, internalOrderId } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !internalOrderId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // SECURITY: Verify the order belongs to the authenticated user before marking as paid
    const order = await prisma.order.findUnique({ where: { id: internalOrderId } });
    if (!order || order.userId !== session.user.id) {
      // Return 404 — never confirm whether the resource exists to the wrong user
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error('Razorpay secret is not configured');
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
    }

    // Verify HMAC signature using timing-safe comparison
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    const sigBuffer = Buffer.from(razorpay_signature,   'hex');
    const expBuffer = Buffer.from(generated_signature,  'hex');
    const isValid   = sigBuffer.length === expBuffer.length &&
                      crypto.timingSafeEqual(sigBuffer, expBuffer);

    if (isValid) {
      // Payment is successful — update order in DB
      await prisma.order.update({
        where: { id: internalOrderId },
        data: {
          paymentStatus: 'PAID',
          razorpayPaymentId: razorpay_payment_id,
        },
      });

      return NextResponse.json({ success: true, message: 'Payment verified successfully' });
    } else {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Razorpay Verification Error:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
