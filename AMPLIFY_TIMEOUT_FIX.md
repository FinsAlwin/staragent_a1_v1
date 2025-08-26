# Fixing 504 Gateway Timeout in AWS Amplify

## Problem

Your resume analysis API is getting 504 Gateway Timeout errors because the process takes longer than the default 30-second timeout limit.

## Root Causes

1. **Default Timeout**: AWS Amplify has a 30-second default timeout
2. **Large File Processing**: PDF/DOCX parsing takes time
3. **AI Analysis**: Gemini API calls can be slow
4. **Memory Constraints**: Insufficient memory allocation

## Solutions Implemented

### 1. **Next.js Configuration Updates**

- Added `maxDuration: 120` (2 minutes) to API routes
- Set `dynamic: 'force-dynamic'` for better performance
- Added timeout headers and server runtime config

### 2. **API Route Optimizations**

- Implemented request timeout handling (2 minutes)
- Added file size validation (10MB limit)
- Enhanced error handling for timeouts
- Added progress logging

### 3. **AWS Amplify Configuration**

- Updated `amplify.yml` with timeout settings
- Added custom headers for API routes
- Configured function timeouts and memory

## Deployment Steps

### Step 1: Update Amplify Console Settings

1. Go to AWS Amplify Console
2. Select your app
3. Go to **App settings** → **Build settings**
4. Update the build specification:

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
    files: ["**/*"]
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*

# Add custom timeout configuration
customHeaders:
  - pattern: "/api/analyze"
    headers:
      - key: "X-Request-Timeout"
        value: "120000"
      - key: "Cache-Control"
        value: "no-cache, no-store, must-revalidate"
  - pattern: "/api/upload/resume"
    headers:
      - key: "X-Request-Timeout"
        value: "120000"
      - key: "Cache-Control"
        value: "no-cache, no-store, must-revalidate"

# Configure function timeouts
functions:
  api:
    timeout: 120
    memory: 1024
```

### Step 2: Environment Variables

Ensure these are set in Amplify Console:

```
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key
NEXT_PUBLIC_MONGODB_URI=your_mongodb_uri
NEXT_PUBLIC_JWT_SECRET=your_jwt_secret
```

### Step 3: Redeploy

1. Commit and push your changes
2. Amplify will automatically rebuild
3. Monitor the build logs for any errors

## Alternative Solutions

### Option 1: Use AWS Lambda Functions

If timeouts persist, consider moving the heavy processing to Lambda:

```javascript
// Create a Lambda function for resume analysis
exports.handler = async (event) => {
  // Process resume analysis here
  // Lambda supports up to 15 minutes timeout
};
```

### Option 2: Implement Background Processing

Use a queue system for long-running tasks:

```javascript
// Queue the analysis job
const job = await queue.add("resume-analysis", {
  fileData: base64File,
  extractionFields,
  tags,
});

// Return job ID immediately
return { jobId: job.id, status: "queued" };
```

### Option 3: Optimize File Processing

- Implement file chunking for large files
- Use streaming for PDF processing
- Cache parsed results

## Testing the Fix

### 1. **Local Testing**

```bash
npm run dev
# Test with a large PDF file
# Check console logs for timeout handling
```

### 2. **Amplify Testing**

1. Deploy to Amplify
2. Test the API endpoint
3. Monitor CloudWatch logs
4. Check for timeout errors

### 3. **Performance Monitoring**

- Monitor API response times
- Track timeout frequency
- Monitor memory usage
- Check Gemini API response times

## Expected Results

After implementing these fixes:

- ✅ **Timeout increased** from 30s to 120s (2 minutes)
- ✅ **Better error handling** for timeouts
- ✅ **File size validation** to prevent large file issues
- ✅ **Progress logging** for debugging
- ✅ **Memory optimization** for better performance

## Troubleshooting

### If timeouts still occur:

1. **Check file sizes**: Ensure files are under 10MB
2. **Monitor logs**: Look for specific bottlenecks
3. **Test with smaller files**: Verify the fix works
4. **Check Amplify settings**: Ensure timeout config is applied
5. **Monitor Gemini API**: Check if AI service is slow

### Common Issues:

- **Build failures**: Check Amplify build logs
- **Config not applied**: Verify amplify.yml is correct
- **Environment variables**: Ensure all required vars are set
- **Memory issues**: Increase memory allocation if needed

## Performance Tips

1. **File Optimization**: Compress PDFs before upload
2. **Batch Processing**: Process multiple files in parallel
3. **Caching**: Cache extraction fields and tags
4. **Monitoring**: Use CloudWatch for performance metrics

## Support

If issues persist:

1. Check Amplify Console logs
2. Monitor CloudWatch metrics
3. Test with smaller files first
4. Consider Lambda migration for heavy processing

## Files Modified

- ✅ `next.config.js` - Added timeout configurations
- ✅ `amplify.yml` - Updated with timeout settings
- ✅ `app/api/analyze/route.ts` - Added timeout handling
- ✅ `app/api/upload/resume/route.ts` - Added timeout handling
- ✅ `amplify/app-settings.json` - Created app settings
- ✅ `amplify/team-provider-info.json` - Environment config

The system should now handle resume analysis without 504 timeouts, with a maximum processing time of 2 minutes.
