import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import cloudinary from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { folder = 'mechart3d/misc' } = await req.json().catch(() => ({}));

  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: `mechart3d/${folder}` },
    process.env.CLOUDINARY_API_SECRET!
  );

  return NextResponse.json({
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey:    process.env.CLOUDINARY_API_KEY,
    folder:    `mechart3d/${folder}`,
  });
}
