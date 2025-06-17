import { writeFile, mkdir, readFile, unlink } from "fs/promises";
import path from "path";

const UPLOAD_DIR = "public/uploads/faces";

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Upload image to local storage (public/uploads/faces)
 * This works with AWS Amplify's file system
 */
export async function uploadImageToLocal(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<UploadResult> {
  try {
    // Create upload directory if it doesn't exist
    const uploadPath = path.join(process.cwd(), UPLOAD_DIR);
    await mkdir(uploadPath, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const fileExtension = fileName.split(".").pop() || "jpg";
    const uniqueFileName = `${timestamp}-${randomId}.${fileExtension}`;

    // Save file to local storage
    const filePath = path.join(uploadPath, uniqueFileName);
    await writeFile(filePath, file);

    // Create URL for the saved image
    const imageUrl = `/uploads/faces/${uniqueFileName}`;
    const key = uniqueFileName;

    console.log(`Image saved locally: ${filePath}`);
    console.log(`Image URL: ${imageUrl}`);

    return { url: imageUrl, key };
  } catch (error) {
    console.error("Error uploading image to local storage:", error);
    throw new Error("Failed to upload image to local storage");
  }
}

/**
 * Get image from local storage
 */
export async function getImageFromLocal(key: string): Promise<Buffer> {
  try {
    const filePath = path.join(process.cwd(), UPLOAD_DIR, key);
    return await readFile(filePath);
  } catch (error) {
    console.error(`Error reading image from local storage: ${key}`, error);
    throw new Error("Failed to read image from local storage");
  }
}

/**
 * Delete image from local storage
 */
export async function deleteImageFromLocal(key: string): Promise<void> {
  try {
    const filePath = path.join(process.cwd(), UPLOAD_DIR, key);
    await unlink(filePath);
    console.log(`Image deleted from local storage: ${key}`);
  } catch (error) {
    console.error(`Error deleting image from local storage: ${key}`, error);
    throw new Error("Failed to delete image from local storage");
  }
}

/**
 * Get local image URL
 */
export function getLocalImageUrl(key: string): string {
  return `/uploads/faces/${key}`;
}
