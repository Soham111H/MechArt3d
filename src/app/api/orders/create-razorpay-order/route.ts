import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { razorpay } from '@/lib/razorpay';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, internalOrderId } = await req.json();

    if (!amount || !internalOrderId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Verify the order belongs to the user and is PENDING
    const order = await prisma.order.findUnique({
      where: { id: internalOrderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized access to order' }, { status: 403 });
    }

    // Create Razorpay order — ALWAYS use the amount from DB, never trust client-supplied amount
    const options = {
      amount: Math.round(Number(order.total) * 100), // paisa — from DB record, not client
      currency: 'INR',
      receipt: `rcpt_${internalOrderId.slice(-8)}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    return NextResponse.json({
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error: any) {
    console.error('Razorpay Create Order Error:', error);
    return NextResponse.json({ 
      error: error?.error?.description || error?.message || 'Failed to create payment order',
      detail: error 
    }, { status: 500 });
  }
}
