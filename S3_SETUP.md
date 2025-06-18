# S3 Setup for Image Uploads

This guide will help you set up AWS S3 for image uploads in the face matching feature.

## Prerequisites

1. AWS Account
2. AWS CLI installed (optional but recommended)

## Step 1: Create S3 Bucket

1. Go to AWS S3 Console
2. Click "Create bucket"
3. Choose a unique bucket name (e.g., `your-app-face-images-2024`)
4. Select your preferred region
5. Keep default settings for now
6. Click "Create bucket"

## Step 2: Configure Bucket for Public Access

1. Go to your bucket
2. Click "Permissions" tab
3. Under "Block public access", click "Edit"
4. Uncheck "Block all public access"
5. Check the acknowledgment and save
6. Go to "Bucket policy" and add this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

Replace `YOUR-BUCKET-NAME` with your actual bucket name.

## Step 3: Create IAM User

1. Go to AWS IAM Console
2. Click "Users" → "Create user"
3. Name: `s3-image-uploader`
4. Select "Programmatic access"
5. Click "Next"
6. Click "Attach policies directly"
7. Search for "AmazonS3FullAccess" and select it
8. Click "Next" and "Create user"
9. **Important**: Copy the Access Key ID and Secret Access Key

## Step 4: Environment Variables

Add these environment variables to your deployment platform (AWS Amplify, Vercel, etc.):

```
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your_access_key_id
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your_secret_access_key
NEXT_PUBLIC_AWS_REGION=your_region (e.g., us-east-1)
NEXT_PUBLIC_S3_BUCKET_NAME=your_bucket_name
```

## Step 5: Test the Setup

1. Deploy your application
2. Go to the admin panel
3. Try uploading an image for face matching
4. Check if the image appears in your S3 bucket

## Security Notes

- The S3 bucket is configured for public read access for images
- Only authenticated users can upload images through the admin panel
- Consider implementing additional security measures like:
  - CloudFront CDN for better performance
  - Signed URLs for private images
  - Image optimization and compression

## Troubleshooting

### Common Issues:

1. **Access Denied**: Check IAM permissions and bucket policy
2. **Region Mismatch**: Ensure AWS_REGION matches your bucket region
3. **Bucket Not Found**: Verify bucket name and region
4. **CORS Issues**: Add CORS configuration to your bucket if needed

### CORS Configuration (if needed):

Add this CORS configuration to your S3 bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

## File Structure

Images will be stored in S3 with this structure:

```
your-bucket/
  faces/
    1703123456789-abc123.jpg
    1703123456790-def456.png
    ...
```

The `faces/` prefix helps organize images and can be used for different image types in the future.
