import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const ENABLE_ONLINE_PAYMENT = process.env.NEXT_PUBLIC_ENABLE_ONLINE_PAYMENT === 'true';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!ENABLE_ONLINE_PAYMENT) {
    return NextResponse.json({ error: "Online payments disabled" }, { status: 403 });
  }

  try {
    // Guard: refuse to process if webhook secret is not configured
    if (!RAZORPAY_WEBHOOK_SECRET) {
      console.error('[Webhook] RAZORPAY_WEBHOOK_SECRET is not set — rejecting request');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    const bodyText = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
      .update(bodyText)
      .digest("hex");

    // Use timing-safe comparison to prevent timing attacks
    const sigBuffer  = Buffer.from(signature,          'hex');
    const expBuffer  = Buffer.from(expectedSignature,  'hex');
    const isValid    = sigBuffer.length === expBuffer.length &&
                       crypto.timingSafeEqual(sigBuffer, expBuffer);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(bodyText);

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const orderId = payment.notes?.orderId; // Make sure to pass orderId in notes when creating order

      if (orderId) {
        // Find order to process
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { orderItems: true }
        });

        if (order && order.paymentStatus !== "PAID") {
          await prisma.$transaction(async (tx) => {
            // Update order status
            await tx.order.update({
              where: { id: orderId },
              data: {
                paymentStatus: "PAID",
                status: "PENDING", // Confirmed paid order
                razorpayPaymentId: payment.id,
              }
            });

            // Decrease stock
            for (const item of order.orderItems) {
              await tx.product.update({
                where: { id: item.productId },
                data: {
                  stock: { decrement: item.quantity }
                }
              });

              if (item.variantId) {
                // If you track variant stock as JSON or separate model, update it here.
                // Assuming it's inside Variant model if it exists
                // await tx.variant.update({ where: { id: item.variantId }, data: { stock: { decrement: item.quantity } } });
              }
            }

            // Notification
            if (order.userId) {
              await tx.notification.create({
                data: {
                  userId: order.userId,
                  type: "ORDER_UPDATE",
                  title: "Payment Successful",
                  message: `Your payment of ₹${(payment.amount / 100).toFixed(2)} for order ${order.orderNumber || order.id.slice(-8)} was successful.`,
                  link: `/account/orders/${order.id}`
                }
              });
            }
          });
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Razorpay Webhook Error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
