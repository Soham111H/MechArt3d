import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { enqueueEmail } from "@/lib/email/queue";



const checkoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().int().min(1),
    price: z.number().min(0),
  })).min(1),
  shippingAddress: z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    addressLine1: z.string().min(5),
    addressLine2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(4),
    country: z.string().default("India"),
  }),
  paymentMethod: z.string().default("COD"),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Note: Allowing guest checkout if no session, or link to user if logged in
    const session = await auth();
    let userId = session?.user?.id;
    
    const body = await req.json();
    const data = checkoutSchema.parse(body);

    if (!userId) {
      // Guest checkout: create or find user by email
      const guestUser = await prisma.user.upsert({
        where: { email: data.shippingAddress.email },
        update: {},
        create: {
          email: data.shippingAddress.email,
          name: `${data.shippingAddress.firstName} ${data.shippingAddress.lastName}`,
          phone: data.shippingAddress.phone,
          role: 'USER',
        }
      });
      userId = guestUser.id;
    }

    // Calculate totals on server to prevent tampering
    let subtotal = 0;

    // 1. Validate Stock and Prices
    for (const item of data.items) {
      const dbProduct = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!dbProduct) return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 });
      if (dbProduct.stock < item.quantity) {
        return NextResponse.json({ error: `Not enough stock for ${dbProduct.name}` }, { status: 400 });
      }

      // Calculate real price
      const basePrice = parseFloat(dbProduct.discountPrice?.toString() || dbProduct.basePrice.toString());
      let variantModifier = 0;
      
      if (item.variantId) {
        const dbVariant = await prisma.variant.findUnique({ where: { id: item.variantId } });
        if (dbVariant) {
          variantModifier = parseFloat(dbVariant.priceModifier.toString());
          if (dbVariant.stock < item.quantity) {
            return NextResponse.json({ error: `Not enough stock for variant of ${dbProduct.name}` }, { status: 400 });
          }
        }
      }

      subtotal += (basePrice + variantModifier) * item.quantity;
    }

    const taxAmount = subtotal * 0.18; // 18% GST
    const shippingAmount = data.paymentMethod === 'COD' ? 50 : 0; // ₹50 for COD
    const totalAmount = subtotal + taxAmount + shippingAmount;

    // 2. Create Order in Transaction
    const order = await prisma.$transaction(async (tx) => {
      
      // Create shipping address record
      const address = await tx.address.create({
        data: {
          userId: userId,
          line1: data.shippingAddress.addressLine1,
          line2: data.shippingAddress.addressLine2,
          city: data.shippingAddress.city,
          state: data.shippingAddress.state,
          pincode: data.shippingAddress.pincode,
          country: data.shippingAddress.country,
        }
      });

      // Create main order
      const newOrder = await tx.order.create({
        data: {
          userId: userId!,
          orderNumber: `ORD-${Date.now()}`,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          paymentMethod: data.paymentMethod === 'ONLINE' ? 'RAZORPAY' : 'COD',
          subtotal: subtotal,
          tax: taxAmount,
          shipping: shippingAmount,
          total: totalAmount,
          addressId: address.id,
          notes: data.notes,
        }
      });

      // Create Order Items and Deduct Stock
      for (const item of data.items) {
        // We verified prices above, calculate again for the row
        const p = await tx.product.findUnique({ where: { id: item.productId } });
        const basePrice = parseFloat(p!.discountPrice?.toString() || p!.basePrice.toString());
        let variantModifier = 0;
        if (item.variantId) {
          const v = await tx.variant.findUnique({ where: { id: item.variantId } });
          if(v) variantModifier = parseFloat(v.priceModifier.toString());
        }
        const finalPrice = basePrice + variantModifier;

        // Create Item
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: finalPrice,
          }
        });

        // Deduct Stock (Product)
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });

        // Deduct Stock (Variant)
        if (item.variantId) {
          await tx.variant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } }
          });
        }
      }

      // Create Initial Status History
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          status: 'PENDING',
          comment: 'Order placed via COD',
        }
      });

      return newOrder;
    });

    // Enqueue order confirmation email (fire-and-forget)
    try {
      const userRecord = await prisma.user.findUnique({
        where: { id: userId! },
        select: { email: true, name: true },
      });
      if (userRecord?.email) {
        enqueueEmail({
          userId: userId,
          to: userRecord.email,
          type: "orderConfirmation",
          templateArgs: [
            order.orderNumber || order.id.slice(-8).toUpperCase(),
            data.items,
            `₹${totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
          ],
        });
      }
    } catch { /* non-fatal */ }

    return NextResponse.json({ success: true, orderId: order.id }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.issues }, { status: 400 });
    }
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: "Failed to process checkout" }, { status: 500 });
  }
}
