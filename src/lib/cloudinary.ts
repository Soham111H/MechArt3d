// src/lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Uploads a base64 string or file buffer to Cloudinary
 * @param file The file buffer or base64 string
 * @param folder The folder to store the asset in (e.g., 'mechart3d/products')
 * @param resourceType 'image', 'video', or 'raw' (for 3D models like .glb)
 */
export async function uploadToCloudinary(
  file: string,
  folder: string = 'mechart3d/misc',
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<{ url: string; publicId: string; format: string }> {
  try {
    const uploadResponse = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: resourceType,
    });

    return {
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
      format: uploadResponse.format,
    };
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
}

/**
 * Deletes a file from Cloudinary using its public ID
 */
export async function deleteFromCloudinary(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image') {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Cloudinary Delete Error:', error);
    throw new Error('Failed to delete file from Cloudinary');
  }
}

export default cloudinary;
