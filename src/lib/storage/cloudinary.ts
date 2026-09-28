import { StorageProvider, UploadOptions } from "./provider";

/**
 * Cloudinary Implementation of the StorageProvider
 * 
 * To switch to AWS S3 in the future, simply create an S3Provider class
 * implementing the StorageProvider interface and swap the export at the bottom.
 */
export class CloudinaryProvider implements StorageProvider {
  async upload(fileBuffer: Buffer, fileName: string, options?: UploadOptions): Promise<string> {
    // MOCK IMPLEMENTATION
    // In production, we would initialize the cloudinary v2 SDK here:
    // cloudinary.uploader.upload_stream(...)
    console.log(`[Cloudinary] Uploading ${fileName} to folder ${options?.folder || 'default'}`);
    return `https://res.cloudinary.com/demo/image/upload/v1/${options?.folder || 'mechart3d'}/${fileName}`;
  }

  async delete(fileUrlOrId: string): Promise<boolean> {
    // MOCK IMPLEMENTATION
    // cloudinary.uploader.destroy(publicId)
    console.log(`[Cloudinary] Deleting ${fileUrlOrId}`);
    return true;
  }
}

// Global export that the rest of the application uses.
// To swap to AWS S3 later, change this to: export const storage = new S3Provider();
export const storage = new CloudinaryProvider();
