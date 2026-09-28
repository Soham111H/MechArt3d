import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { logAdminAction } from "@/lib/security/security-log";
import { getClientIp } from "@/lib/security/rate-limit";
import { sanitizeObject } from "@/lib/security/sanitize";
import { enqueueEmail } from "@/lib/email/queue";

const updateSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PRINTING', 'QUALITY_CHECK', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  notes: z.string().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "STAFF", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const sanitizedBody = sanitizeObject(body);
    const data = updateSchema.parse(sanitizedBody);

    const orderId = params.id;

    const order = await prisma.$transaction(async (tx) => {
      // Update the main order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { 
          status: data.status,
          ...(data.paymentStatus && { paymentStatus: data.paymentStatus }),
        }
      });

      // Add to status history timeline
      await tx.orderStatusHistory.create({
        data: {
          orderId: orderId,
          status: data.status,
          comment: data.notes || `Order status updated to ${data.status} by Admin.`,
        }
      });

      // Send in-app notification
      const fullOrder = await tx.order.findUnique({ where: { id: orderId } });
      if (fullOrder && fullOrder.userId) {
        await tx.notification.create({
          data: {
            userId: fullOrder.userId,
            type: "ORDER_UPDATE",
            title: "Order Status Updated",
            message: `Your order ${fullOrder.orderNumber || orderId.slice(-8)} is now ${data.status.replace(/_/g, ' ')}.`,
            link: `/account/orders/${orderId}`,
          }
        });
      }

      return updatedOrder;
    });

    // Log admin action
    await logAdminAction(
      session.user.id,
      "UPDATED_ORDER_STATUS",
      "ORDERS",
      { orderId, status: data.status },
      getClientIp(req)
    );

    // Send status/shipping email to customer
    try {
      const fullOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: { user: { select: { email: true, name: true } } },
      });
      if (fullOrder?.user?.email) {
        const orderRef = fullOrder.orderNumber || orderId.slice(-8).toUpperCase();
        if (data.status === 'SHIPPED') {
          enqueueEmail({
            userId: fullOrder.userId,
            to: fullOrder.user.email,
            type: 'shipping',
            templateArgs: [
              orderRef,
              fullOrder.trackingNumber || 'N/A',
              fullOrder.courierName || 'Courier',
            ],
          });
        } else if (data.status !== 'PENDING') {
          enqueueEmail({
            userId: fullOrder.userId,
            to: fullOrder.user.email,
            type: 'orderStatus',
            templateArgs: [orderRef, data.status.replace(/_/g, ' ')],
          });
        }
      }
    } catch { /* non-fatal */ }

    return NextResponse.json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.issues }, { status: 400 });
    }
    console.error("PUT Admin Order Error:", error);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}
