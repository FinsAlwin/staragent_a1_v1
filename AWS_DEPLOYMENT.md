# AWS Deployment Guide for AI Face Matching

## 🚀 Recommended Architecture: AWS Amplify + Lambda

### **Services Used:**

- **AWS Amplify** - Hosting and CI/CD
- **AWS Lambda** - Serverless API functions
- **Amazon S3** - Image storage
- **Amazon CloudFront** - CDN for images
- **MongoDB Atlas** - Database (or Amazon DocumentDB)

---

## 📋 Prerequisites

### **1. AWS Account Setup**

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS credentials
aws configure
```

### **2. Required Environment Variables**

```env
# Gemini AI
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-face-matching-bucket
```

---

## 🛠️ Step-by-Step Deployment

### **Step 1: Create S3 Bucket**

```bash
# Create S3 bucket for image storage
aws s3 mb s3://your-face-matching-bucket --region us-east-1

# Configure bucket for public read access
aws s3api put-bucket-policy --bucket your-face-matching-bucket --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-face-matching-bucket/*"
    }
  ]
}'
```

### **Step 2: Deploy with AWS Amplify**

#### **Option A: AWS Amplify Console (Recommended)**

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" → "Host web app"
3. Connect your GitHub repository
4. Configure build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - "**/*"
   ```
5. Add environment variables
6. Deploy!

#### **Option B: AWS Amplify CLI**

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Push to AWS
amplify push
```

### **Step 3: Configure Lambda Functions (if needed)**

For better performance, you can extract API routes to Lambda:

```bash
# Add API
amplify add api

# Choose REST API
# Configure routes for face matching
```

---

## 🔧 Configuration Files

### **1. Amplify Configuration (amplify.yml)**

```yaml
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: .next
        files:
          - "**/*"
      cache:
        paths:
          - node_modules/**/*
          - .next/cache/**/*
```

### **2. Next.js Configuration (next.config.js)**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    domains: ["your-face-matching-bucket.s3.amazonaws.com"],
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

---

## 💰 Cost Estimation

### **Monthly Costs (estimated):**

- **AWS Amplify**: $0.15 per build minute + $0.01 per GB served
- **AWS Lambda**: $0.20 per 1M requests + $0.0000166667 per GB-second
- **Amazon S3**: $0.023 per GB stored + $0.0004 per 1K requests
- **CloudFront**: $0.085 per GB transferred

### **Example Monthly Cost (1000 users):**

- **Amplify Hosting**: ~$5-10
- **Lambda API calls**: ~$2-5
- **S3 Storage (1GB)**: ~$0.02
- **CloudFront CDN**: ~$1-3
- **Total**: ~$8-18/month

---

## 🔒 Security Considerations

### **1. Environment Variables**

- Store sensitive data in AWS Systems Manager Parameter Store
- Use AWS Secrets Manager for API keys

### **2. CORS Configuration**

```javascript
// Configure CORS for your domain
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://yourdomain.com",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
```

### **3. S3 Bucket Security**

```bash
# Enable bucket versioning
aws s3api put-bucket-versioning --bucket your-face-matching-bucket --versioning-configuration Status=Enabled

# Enable server-side encryption
aws s3api put-bucket-encryption --bucket your-face-matching-bucket --server-side-encryption-configuration '{
  "Rules": [
    {
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }
  ]
}'
```

---

## 🚀 Alternative Deployment Options

### **Option 2: AWS ECS + Fargate**

- Better for high-performance AI processing
- No cold start latency
- More expensive but more reliable

### **Option 3: AWS EC2**

- Full control over infrastructure
- Cost-effective for consistent traffic
- Requires server management

---

## 📞 Support

For deployment issues:

1. Check AWS Amplify build logs
2. Verify environment variables
3. Test API endpoints individually
4. Monitor CloudWatch logs

---

## 🔄 CI/CD Pipeline

### **GitHub Actions (Alternative)**

```yaml
name: Deploy to AWS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run build
      - uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - run: aws s3 sync .next s3://your-bucket --delete
```

---

## ✅ Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] S3 bucket created and configured
- [ ] CORS headers set correctly
- [ ] API endpoints tested
- [ ] Image uploads working
- [ ] Face matching functionality verified
- [ ] SSL certificate configured
- [ ] Monitoring and logging set up
- [ ] Backup strategy implemented
