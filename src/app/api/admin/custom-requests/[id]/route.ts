import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWING', 'QUOTED', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED']),
  quotedPrice: z.number().optional().nullable(),
  adminNotes: z.string().optional().nullable(),
  fileUrl: z.string().optional().nullable(),
  sendEmailNotification: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "STAFF", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const data = updateSchema.parse(body);

    const updatePayload: any = {
      status: data.status,
      quotedPrice: data.quotedPrice,
      adminNotes: data.adminNotes,
      assignedStaffId: session.user.id,
    };
    if (data.fileUrl !== undefined) {
      updatePayload.fileUrl = data.fileUrl;
    }

    const updated = await prisma.customRequest.update({
      where: { id: params.id },
      data: updatePayload,
    });

    if (updated.userId) {
      await prisma.notification.create({
        data: {
          userId: updated.userId,
          type: "SYSTEM",
          title: "Request Updated",
          message: `Your request for "${updated.title}" is now ${data.status.replace(/_/g, ' ')}.${data.quotedPrice ? ` Quote: ₹${data.quotedPrice}` : ''}`,
          link: "/account/custom-requests",
        }
      });

      // Send email to customer with file or quote details if requested
      if (data.sendEmailNotification) {
        try {
          const targetUser = await prisma.user.findUnique({
            where: { id: updated.userId },
            select: { email: true, name: true },
          });

          if (targetUser?.email) {
            const fileLink = data.fileUrl || updated.fileUrl;
            await sendEmail({
              to: targetUser.email,
              subject: data.status === "COMPLETED"
                ? `📦 Your 3D Digital File for "${updated.title}" is Ready! — MechArt 3D`
                : `💬 Update on your request: "${updated.title}" — MechArt 3D`,
              html: `
                <div style="font-family:sans-serif;max-width:540px;margin:30px auto;padding:28px;background:#f8fafc;border-radius:16px;">
                  <div style="background:#1D4ED8;border-radius:12px;padding:20px;text-align:center;margin-bottom:20px;">
                    <h1 style="color:#fff;margin:0;font-size:22px;font-weight:900;">MechArt 3D</h1>
                  </div>
                  <h2 style="color:#0f172a;margin:0 0 10px;">${data.status === 'COMPLETED' ? 'Your 3D Digital File is Ready!' : 'Your Request Status Has Been Updated'}</h2>
                  <p style="color:#475569;line-height:1.5;">Hi ${targetUser.name || 'there'}, your request for <strong>${updated.title}</strong> has been marked as <strong>${data.status.replace(/_/g, ' ')}</strong>.</p>
                  ${data.quotedPrice ? `<div style="background:#f0fdf4;padding:12px 16px;border-radius:8px;margin:16px 0;color:#166534;font-size:15px;font-weight:bold;">Quoted Price: ₹${Number(data.quotedPrice).toLocaleString('en-IN')}</div>` : ''}
                  ${data.adminNotes ? `<div style="background:#e0f2fe;padding:12px 16px;border-radius:8px;margin:16px 0;color:#0369a1;font-size:14px;"><strong>Admin note:</strong> ${data.adminNotes}</div>` : ''}
                  ${fileLink ? `
                    <div style="text-align:center;margin:24px 0;">
                      <a href="${fileLink}" style="display:inline-block;background:#1D4ED8;color:#fff;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;">
                        📥 Download Your 3D File
                      </a>
                    </div>
                    <p style="font-size:12px;color:#94a3b8;text-align:center;">Direct link: <a href="${fileLink}" style="color:#1D4ED8;">${fileLink}</a></p>
                  ` : ''}
                  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
                  <p style="font-size:12px;color:#94a3b8;margin:0;text-align:center;">You can also check the status anytime in your <a href="https://mech-art3d.vercel.app/account/custom-requests" style="color:#1D4ED8;">Account Dashboard</a>.</p>
                </div>
              `,
            });
          }
        } catch (emailErr) {
          console.error("Failed to email customer:", emailErr);
        }
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.issues }, { status: 400 });
    }
    console.error("PUT Admin Custom Request Error:", error);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "STAFF", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.customRequest.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Custom request deleted successfully" });
  } catch (error) {
    console.error("DELETE Admin Custom Request Error:", error);
    return NextResponse.json({ error: "Failed to delete request" }, { status: 500 });
  }
}

