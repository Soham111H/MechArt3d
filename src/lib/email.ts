// src/lib/email.ts
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

export async function getEmailConfig() {
  let dbSettings: Record<string, any> = {};
  try {
    const rows = await prisma.setting.findMany({
      where: {
        key: {
          in: ["smtpHost", "smtpPort", "smtpUser", "smtpPass", "smtpSecure", "smtpFrom", "storeEmail", "storeName"]
        }
      }
    });
    for (const r of rows) {
      try {
        dbSettings[r.key] = typeof r.value === "string" && (r.value.startsWith('"') || r.value === "true" || r.value === "false") ? JSON.parse(r.value) : r.value;
      } catch {
        dbSettings[r.key] = r.value;
      }
    }
  } catch {
    // If DB query fails, fall back to process.env
  }

  const user = dbSettings.smtpUser || process.env.SMTP_USER || process.env.EMAIL_USER || process.env.GMAIL_USER || "";
  const pass = dbSettings.smtpPass || process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.EMAIL_PASS || process.env.GMAIL_PASS || "";
  const host = dbSettings.smtpHost || process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(dbSettings.smtpPort || process.env.SMTP_PORT || (host.includes("gmail") ? 587 : 587));
  const secure = dbSettings.smtpSecure === "true" || dbSettings.smtpSecure === true || process.env.SMTP_SECURE === "true" || port === 465;
  const from = dbSettings.smtpFrom || process.env.EMAIL_FROM || process.env.SMTP_FROM || (dbSettings.storeName ? `"${dbSettings.storeName}" <${user || "noreply@mechart3d.com"}>` : "MechArt 3D <noreply@mechart3d.com>");

  const isConfigured = Boolean(
    user &&
    !user.includes("placeholder") &&
    pass &&
    !pass.includes("placeholder")
  );

  return { host, port, secure, user, pass, from, isConfigured };
}

interface SendEmailOptions {
  to:      string;
  subject: string;
  html:    string;
  text?:   string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const config = await getEmailConfig();

  if (!config.isConfigured) {
    const errorMsg = "SMTP is not configured. Please set SMTP User and Password in Admin Settings or set SMTP environment variables.";
    console.warn(`⚠️ [email] ${errorMsg}`);
    return { success: false, error: errorMsg, preview: null };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    const info = await transporter.sendMail({
      from: config.from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, ""),
    });

    console.log(`[email] ✅ Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`[email] ❌ Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

// ─── Email Templates ──────────────────────────────────────────────────────────

export function passwordResetTemplate(name: string, resetUrl: string) {
  const appName = "MechArt 3D";
  return {
    subject: `Reset your ${appName} password`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1D4ED8,#3B82F6);padding:36px;text-align:center;">
            <div style="display:inline-flex;align-items:center;gap:10px;">
              <div style="width:40px;height:40px;background:rgba(255,255,255,0.2);border-radius:10px;display:inline-block;text-align:center;line-height:40px;font-size:20px;">⬡</div>
              <span style="color:#ffffff;font-size:22px;font-weight:900;letter-spacing:-0.5px;">${appName}</span>
            </div>
          </td>
        </tr>
        
        <!-- Body -->
        <tr>
          <td style="padding:40px 48px;">
            <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#0f172a;">Reset your password</h1>
            <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">
              Hi ${name || "there"}, we received a request to reset your password. Click the button below to create a new one. This link expires in <strong>15 minutes</strong>.
            </p>
            
            <div style="text-align:center;margin:32px 0;">
              <a href="${resetUrl}" style="display:inline-block;background:#1D4ED8;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:10px;letter-spacing:-0.2px;">
                Reset My Password →
              </a>
            </div>
            
            <p style="margin:0;color:#94a3b8;font-size:13px;text-align:center;">
              If you didn't request this, please ignore this email. Your password won't change.
            </p>
            
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">
              Or copy this link: <span style="color:#1D4ED8;">${resetUrl}</span>
            </p>
          </td>
        </tr>
        
        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:20px 48px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    text: `Reset your MechArt 3D password\n\nHi ${name || "there"},\n\nClick this link to reset your password (expires in 15 minutes):\n${resetUrl}\n\nIf you didn't request this, ignore this email.`,
  };
}
