import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { to } = body;
  if (!to || typeof to !== 'string') {
    return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
  }

  try {
    await sendEmail({
      to,
      subject: '✅ MechArt 3D — SMTP Test Successful',
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:40px auto;padding:32px;background:#f8fafc;border-radius:16px;">
          <div style="background:#1D4ED8;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
            <h1 style="color:#fff;margin:0;font-size:22px;font-weight:900;">MechArt 3D</h1>
          </div>
          <h2 style="color:#0f172a;margin:0 0 12px;">✅ SMTP is working!</h2>
          <p style="color:#475569;">If you received this email, your SMTP configuration is correct and transactional emails are active.</p>
          <div style="background:#e0f2fe;border-radius:10px;padding:16px;margin-top:20px;">
            <p style="margin:0;color:#0369a1;font-size:13px;font-weight:600;">Sent from MechArt 3D Admin Panel · ${new Date().toLocaleString('en-IN')}</p>
          </div>
        </div>`,
    });
    return NextResponse.json({ success: true, message: 'Test email sent successfully!' });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to send email', detail: err.message },
      { status: 500 }
    );
  }
}
