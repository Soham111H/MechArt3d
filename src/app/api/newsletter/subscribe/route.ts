import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { rateLimit, getClientIp } from '@/lib/security/rate-limit';

const schema = z.object({
  email: z.string().email().max(255),
  name:  z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = await rateLimit(`newsletter:${ip}`, 3, 60 * 60 * 1000);
  if (!rl.allowed) return NextResponse.json({ error: 'Too many attempts.' }, { status: 429 });

  try {
    const body = await req.json();
    const { email, name } = schema.parse(body);

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (existing) {
      if (existing.isActive) {
        return NextResponse.json({ message: 'You are already subscribed!' });
      }
      await prisma.newsletterSubscriber.update({ where: { email }, data: { isActive: true } });
      return NextResponse.json({ success: true, message: 'Welcome back! You have been re-subscribed.' });
    }

    await prisma.newsletterSubscriber.create({ data: { email, name } });
    return NextResponse.json({ success: true, message: "Thanks for subscribing! We'll keep you updated." });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 });
    console.error('[newsletter/subscribe]', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
