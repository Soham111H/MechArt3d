/**
 * src/lib/email/queue.ts
 * Fire-and-forget email queue.
 * Sends via Nodemailer immediately in the background without blocking API responses.
 */
import { prisma } from '../prisma';
import { sendEmail } from '../email';
import { getTemplate } from './templates';

export interface EmailJob {
  userId?: string;
  to: string;
  type: keyof typeof getTemplate;
  templateArgs: unknown[];
}

const SUBJECT_MAP: Record<string, string> = {
  welcome:               'Welcome to MechArt 3D! 🎉',
  verification:          'Verify your email — MechArt 3D',
  loginAlert:            'New login to your MechArt 3D account',
  newDeviceAlert:        '⚠️ New device login detected — MechArt 3D',
  passwordReset:         'Reset your MechArt 3D password',
  passwordChanged:       'Your password was changed — MechArt 3D',
  orderConfirmation:     '✅ Order Confirmed — MechArt 3D',
  orderStatus:           '📦 Order Status Update — MechArt 3D',
  shipping:              '🚚 Your order has been shipped!',
  refund:                'Refund Processed — MechArt 3D',
  customRequestReceived: 'Custom Request Received — MechArt 3D',
  quoteSent:             '💰 Your Custom Quote is Ready!',
  accountBanned:         'Important Notice — MechArt 3D',
  birthday:              '🎂 Happy Birthday from MechArt 3D!',
  wishlistSale:          '🔥 Your wishlist item is on sale!',
  abandonedCart:         'You left something behind... 👀',
};

/**
 * Enqueue and immediately fire an email in the background.
 * Never await this — it must not block the API response.
 */
export function enqueueEmail(job: EmailJob): void {
  sendEmailBackground(job).catch(err =>
    console.error(`[email-queue] Unhandled error sending ${job.type}:`, err)
  );
}

async function sendEmailBackground(job: EmailJob): Promise<void> {
  let logId: string | null = null;

  try {
    // Create PENDING log entry
    const log = await prisma.emailLog.create({
      data: {
        userId: job.userId ?? null,
        type: job.type,
        status: 'PENDING',
      },
    });
    logId = log.id;

    // Build the HTML from the template
    const templateFn = (getTemplate as any)[job.type] as (...args: any[]) => string;
    if (!templateFn) throw new Error(`Unknown email template: ${job.type}`);
    const html    = templateFn(...(job.templateArgs as any[]));
    const subject = SUBJECT_MAP[job.type] || 'MechArt 3D Notification';

    // Send via Nodemailer
    await sendEmail({ to: job.to, subject, html });

    // Mark as SENT
    if (logId) {
      await prisma.emailLog.update({
        where: { id: logId },
        data: { status: 'SENT', sentAt: new Date() },
      });
    }

    console.log(`[email-queue] ✅ Sent "${job.type}" to ${job.to}`);
  } catch (error) {
    console.error(`[email-queue] ❌ Failed "${job.type}" to ${job.to}:`, error);
    if (logId) {
      await prisma.emailLog
        .update({ where: { id: logId }, data: { status: 'FAILED', error: String(error) } })
        .catch(() => {});
    }
  }
}
