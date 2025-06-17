# 🚀 AWS Amplify Deployment Guide

## **Overview**

This guide will help you deploy your AI Face Matching application to AWS Amplify with local file storage (no S3 required).

---

## **📋 Prerequisites**

1. **AWS Account** - Free tier available
2. **GitHub Repository** - Your code must be in a Git repo
3. **MongoDB Atlas** - For database (free tier available)
4. **Google Gemini API Key** - For AI face analysis

---

## **🔧 Step 1: Prepare Your Repository**

### **1.1 Update .gitignore**

```bash
# Add to .gitignore
public/uploads/
.next/
node_modules/
.env.local
.env.production
```

### **1.2 Create uploads directory**

```bash
mkdir -p public/uploads/faces
```

### **1.3 Commit your changes**

```bash
git add .
git commit -m "Prepare for AWS Amplify deployment"
git push
```

---

## **🚀 Step 2: Deploy to AWS Amplify**

### **2.1 Access AWS Amplify Console**

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Sign in to your AWS account
3. Click **"New app"** → **"Host web app"**

### **2.2 Connect Repository**

1. Choose **"GitHub"** as your repository service
2. Authorize AWS Amplify to access your GitHub
3. Select your repository
4. Choose the branch (usually `main` or `master`)

### **2.3 Configure Build Settings**

Amplify will auto-detect Next.js, but verify these settings:

**Build settings (use this if you encounter Node.js issues):**

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - echo "Installing dependencies..."
        - npm ci --legacy-peer-deps --no-audit --ignore-scripts
    build:
      commands:
        - echo "Building the application..."
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

### **2.4 Add Environment Variables**

In the Amplify Console, go to **"Environment variables"** and add:

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_here
```

### **2.5 Deploy**

Click **"Save and deploy"** - Amplify will build and deploy your app!

---

## **🔧 Step 3: Configure Domain (Optional)**

### **3.1 Custom Domain**

1. In Amplify Console, go to **"Domain management"**
2. Click **"Add domain"**
3. Enter your domain name
4. Follow the DNS configuration instructions

### **3.2 Subdomain**

Your app will be available at: `https://your-app-id.amplifyapp.com`

---

## **📁 Step 4: File Storage Configuration**

### **4.1 Local Storage Setup**

The app is configured to store images in `public/uploads/faces/`:

- ✅ **No S3 required**
- ✅ **Works with Amplify's file system**
- ✅ **Automatic cleanup on redeploy**

### **4.2 Storage Limits**

- **File size**: Max 10MB per image
- **Supported formats**: JPG, PNG, GIF, WebP
- **Storage location**: `public/uploads/faces/`

---

## **🔍 Step 5: Testing Your Deployment**

### **5.1 Test the Application**

1. Visit your Amplify URL
2. Test the public demo: `/demo`
3. Test admin panel: `/admin` (login required)
4. Upload and test face matching

### **5.2 API Endpoints**

- **Public API**: `https://your-app.amplifyapp.com/api/face-matching/match`
- **Admin API**: `https://your-app.amplifyapp.com/api/admin/face-matching/images`

---

## **💰 Step 6: Cost Optimization**

### **6.1 Free Tier Limits**

- **Build minutes**: 1,000 minutes/month
- **Storage**: 15GB
- **Data transfer**: 15GB/month

### **6.2 Monitoring Usage**

1. Go to AWS Amplify Console
2. Check **"Usage"** tab
3. Monitor build minutes and storage

---

## **🔧 Step 7: Troubleshooting**

### **7.1 Common Issues**

**Node.js Version Issues:**

```bash
# If you see "Unsupported engine" errors:
# 1. Use the simple build configuration above
# 2. Or manually set Node.js version in Amplify Console
# 3. Check that package.json engines field is compatible
```

**Build Failures:**

```bash
# Check build logs in Amplify Console
# Common fixes:
npm ci --legacy-peer-deps --no-audit --ignore-scripts
```

**Environment Variables:**

- Ensure all variables are set correctly
- Check for typos in variable names
- Verify MongoDB connection string

**File Upload Issues:**

- Check file size limits
- Verify image format support
- Ensure uploads directory exists

### **7.2 Alternative Build Configurations**

**If the main configuration fails, try this simpler one:**

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci --legacy-peer-deps --no-audit --ignore-scripts
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - "**/*"
```

**For Node.js version issues:**

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        - export NVM_DIR="$HOME/.nvm"
        - [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        - nvm install 18
        - nvm use 18
        - npm ci --legacy-peer-deps --no-audit
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
```

### **7.3 Debug Commands**

```bash
# Local testing
npm run build
npm start

# Check environment variables
echo $NEXT_PUBLIC_GEMINI_API_KEY
```

---

## **🚀 Step 8: Production Considerations**

### **8.1 Performance**

- Images are served from local storage
- Consider CDN for global users
- Monitor build times

### **8.2 Security**

- JWT tokens for admin access
- Environment variables for secrets
- HTTPS enabled by default

### **8.3 Scaling**

- Upgrade to paid plans for higher limits
- Consider S3 for large-scale image storage
- Monitor usage and performance

---

## **📊 Step 9: Monitoring & Analytics**

### **9.1 AWS CloudWatch**

- Monitor application performance
- Set up alerts for errors
- Track usage metrics

### **9.2 Application Monitoring**

- Check Amplify Console for build status
- Monitor API response times
- Track user interactions

---

## **✅ Deployment Checklist**

- [ ] Repository connected to Amplify
- [ ] Environment variables configured
- [ ] Build successful
- [ ] Domain configured (optional)
- [ ] MongoDB connection working
- [ ] Gemini API key working
- [ ] Image uploads working
- [ ] Face matching functionality tested
- [ ] Admin panel accessible
- [ ] Public demo working
- [ ] SSL certificate active
- [ ] Performance tested

---

## **🎉 Success!**

Your AI Face Matching application is now deployed on AWS Amplify with:

- ✅ **Local file storage** (no S3 required)
- ✅ **Automatic HTTPS**
- ✅ **Global CDN**
- ✅ **Easy scaling**
- ✅ **Cost-effective**

**Your app URL**: `https://your-app-id.amplifyapp.com`

---

## **📞 Support**

- **AWS Amplify Docs**: [docs.amplify.aws](https://docs.amplify.aws)
- **AWS Support**: Available with paid plans
- **Community**: AWS Amplify Discord/Forums

**Happy deploying! 🚀**
