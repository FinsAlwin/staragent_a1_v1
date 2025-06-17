import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME =
  process.env.AWS_S3_BUCKET_NAME || "your-face-matching-bucket";

export interface UploadResult {
  url: string;
  key: string;
}

export async function uploadImageToS3(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<UploadResult> {
  const key = `faces/${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
    ACL: "public-read",
  });

  await s3Client.send(command);

  const url = `https://${BUCKET_NAME}.s3.${
    process.env.AWS_REGION || "us-east-1"
  }.amazonaws.com/${key}`;

  return { url, key };
}

export async function getImageFromS3(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const response = await s3Client.send(command);
  const chunks: Uint8Array[] = [];

  if (response.Body) {
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }
  }

  return Buffer.concat(chunks);
}

export async function deleteImageFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

export function getS3ImageUrl(key: string): string {
  return `https://${BUCKET_NAME}.s3.${
    process.env.AWS_REGION || "us-east-1"
  }.amazonaws.com/${key}`;
}
