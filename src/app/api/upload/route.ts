import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import cloudinary from '@/lib/cloudinary';
import { v4 as uuidv4 } from 'uuid';

// Set to true to use Cloudinary for uploads instead of local storage
const USE_CLOUDINARY = true;

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_MODEL_TYPES = ['application/octet-stream', 'model/gltf-binary', 'model/obj'];
const ALLOWED_EXTENSIONS  = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.glb', '.obj', '.stl', '.3mf'];

const MAX_IMAGE_BYTES = 5  * 1024 * 1024;  // 5 MB
const MAX_MODEL_BYTES = 50 * 1024 * 1024;  // 50 MB

function getExtension(filename: string) {
  return filename.slice(filename.lastIndexOf('.')).toLowerCase();
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      return NextResponse.json({ error: `File type ${ext} is not allowed.` }, { status: 400 });
    }

    if (file.size > maxBytes) {
      const maxMB = maxBytes / (1024 * 1024);
      return NextResponse.json({ error: `File too large. Maximum ${maxMB}MB allowed.` }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // SECURITY: Validate folder against strict allowlist to prevent path traversal
    const ALLOWED_FOLDERS = ['products', 'banners', 'models', 'misc', 'avatars', 'custom'];
    const safeFolder = ALLOWED_FOLDERS.includes(folder) ? folder : 'misc';

    if (USE_CLOUDINARY) {
      return new Promise<NextResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: `mechart3d/${safeFolder}`, resource_type: resourceType, timeout: 120000 },
          (error, result) => {
            if (error) {
              console.error("Cloudinary Stream Error:", error);
              resolve(NextResponse.json({ error: 'Cloudinary upload failed' }, { status: 500 }));
            } else if (result) {
              resolve(NextResponse.json({ success: true, url: result.secure_url, publicId: result.public_id }));
            }
          }
        );
        uploadStream.end(buffer);
      });
    } else {
      // Local Upload Implementation
      const fileName = `${uuidv4()}${ext}`;
      const uploadDir = join(process.cwd(), 'public', 'uploads', safeFolder);
      await mkdir(uploadDir, { recursive: true });
      const filePath = join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      return NextResponse.json({ success: true, url: `/uploads/${safeFolder}/${fileName}` });
    }
  } catch (error: any) {
    console.error('Upload Error:', error);
    // SECURITY: never expose internal error details to client
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}
