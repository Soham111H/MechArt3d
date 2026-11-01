import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import cloudinary from '@/lib/cloudinary';
import { v4 as uuidv4 } from 'uuid';

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_MODEL_TYPES = ['application/octet-stream', 'model/gltf-binary', 'model/obj'];
const ALLOWED_EXTENSIONS  = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.glb', '.obj', '.stl', '.3mf'];

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;  // 10 MB
const MAX_MODEL_BYTES = 50 * 1024 * 1024;  // 50 MB

function getExtension(filename: string) {
  const idx = filename.lastIndexOf('.');
  return idx !== -1 ? filename.slice(idx).toLowerCase() : '';
}

async function saveLocally(buffer: Buffer, safeFolder: string, ext: string): Promise<string> {
  const fileName = `${uuidv4()}${ext}`;
  const uploadDir = join(process.cwd(), 'public', 'uploads', safeFolder);
  await mkdir(uploadDir, { recursive: true });
  const filePath = join(uploadDir, fileName);
  await writeFile(filePath, buffer);
  return `/uploads/${safeFolder}/${fileName}`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    const formData = await req.formData();
    const file     = formData.get('file') as File | null;
    const folder   = (formData.get('folder') as string) || 'misc';

    if (!file) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 });
    }

    const ext          = getExtension(file.name);
    const is3DModel    = ['.glb', '.obj', '.stl', '.3mf'].includes(ext);
    const maxBytes     = is3DModel ? MAX_MODEL_BYTES : MAX_IMAGE_BYTES;
    const resourceType = is3DModel ? 'raw' : 'image';

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ error: `File type ${ext || 'unknown'} is not allowed.` }, { status: 400 });
    }

    if (file.size > maxBytes) {
      const maxMB = maxBytes / (1024 * 1024);
      return NextResponse.json({ error: `File too large. Maximum ${maxMB}MB allowed.` }, { status: 400 });
    }

    // Security: Validate folder against strict allowlist
    const ALLOWED_FOLDERS = ['products', 'banners', 'models', 'misc', 'avatars', 'custom'];
    const safeFolder = ALLOWED_FOLDERS.includes(folder) ? folder : 'misc';

    // If uploading to admin-specific folders, require admin or staff session
    if (['products', 'banners'].includes(safeFolder)) {
      if (!session || !['SUPER_ADMIN', 'ADMIN', 'STAFF'].includes(session.user.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const hasCloudinary = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    if (hasCloudinary) {
      try {
        const cloudinaryResult = await new Promise<{ url: string; publicId: string }>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: `mechart3d/${safeFolder}`, resource_type: resourceType, timeout: 60000 },
            (error, result) => {
              if (error || !result) {
                reject(error || new Error('No result from Cloudinary'));
              } else {
                resolve({ url: result.secure_url, publicId: result.public_id });
              }
            }
          );
          uploadStream.end(buffer);
        });

        return NextResponse.json({
          success: true,
          url: cloudinaryResult.url,
          publicId: cloudinaryResult.publicId,
        });
      } catch (cloudErr) {
        console.warn('Cloudinary upload failed, falling back to local storage:', cloudErr);
        // Fallback to local
        const localUrl = await saveLocally(buffer, safeFolder, ext);
        return NextResponse.json({ success: true, url: localUrl });
      }
    } else {
      // Local Upload
      const localUrl = await saveLocally(buffer, safeFolder, ext);
      return NextResponse.json({ success: true, url: localUrl });
    }
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}
