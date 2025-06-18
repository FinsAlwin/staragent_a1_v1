import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export interface UploadResult {
  url: string;
  key: string;
}

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.NEXT_PUBLIC_S3_BUCKET_NAME!;
const BUCKET_REGION = process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1";

/**
 * Upload image to S3
 */
export async function uploadImageToS3(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<UploadResult> {
  try {
    if (!BUCKET_NAME) {
      throw new Error("S3 bucket name is not configured");
    }

    if (
      !process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID ||
      !process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY
    ) {
      throw new Error("AWS credentials are not configured");
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const fileExtension = fileName.split(".").pop() || "jpg";
    const uniqueFileName = `faces/${timestamp}-${randomId}.${fileExtension}`;

    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueFileName,
      Body: file,
      ContentType: contentType,
    });

    await s3Client.send(uploadCommand);

    // Create S3 URL
    const imageUrl = `https://${BUCKET_NAME}.s3.${BUCKET_REGION}.amazonaws.com/${uniqueFileName}`;

    return { url: imageUrl, key: uniqueFileName };
  } catch (error: any) {
    console.error("Error uploading image to S3:", error);
    throw new Error(`Failed to upload image to S3: ${error.message}`);
  }
}

/**
 * Delete image from S3
 */
export async function deleteImageFromS3(key: string): Promise<void> {
  try {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(deleteCommand);
  } catch (error) {
    console.error(`Error deleting image from S3: ${key}`, error);
    throw new Error("Failed to delete image from S3");
  }
}

/**
 * Get signed URL for private S3 objects (if needed)
 */
export async function getSignedImageUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error(`Error generating signed URL for: ${key}`, error);
    throw new Error("Failed to generate signed URL");
  }
}

/**
 * Get S3 image URL
 */
export function getS3ImageUrl(key: string): string {
  return `https://${BUCKET_NAME}.s3.${BUCKET_REGION}.amazonaws.com/${key}`;
}
