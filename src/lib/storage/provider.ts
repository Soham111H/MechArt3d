/**
 * File Storage Abstraction Layer
 * 
 * This interface allows us to swap between Cloudinary, AWS S3, or Local storage
 * without changing any business logic in our API routes or frontend components.
 */

export interface UploadOptions {
  folder?: string;
  resourceType?: "image" | "video" | "raw" | "auto";
  publicId?: string;
}

export interface StorageProvider {
  /**
   * Uploads a file buffer and returns the public URL
   */
  upload(fileBuffer: Buffer, fileName: string, options?: UploadOptions): Promise<string>;
  
  /**
   * Deletes a file by its public URL or ID
   */
  delete(fileUrlOrId: string): Promise<boolean>;
}
