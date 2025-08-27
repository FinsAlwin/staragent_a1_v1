# 📚 Public API Documentation

## Resume Analysis API - No Authentication Required

This API provides **public access** to resume analysis services without requiring authentication. Perfect for integration with external projects, mobile apps, or third-party services.

**✅ Both endpoints are now completely public and require no authentication!**

---

## 🚀 **API Endpoints**

### **1. Start Resume Analysis**

```http
POST /api/analyze
```

**Description:** Upload a resume and start AI-powered analysis. Returns immediately with a job ID for background processing.

**Request:**

- **Content-Type:** `multipart/form-data`
- **Body:** Form data with resume file and analysis parameters

**Form Fields:**

- `resume` - Resume file (PDF or DOCX, max 10MB)
- `extractionFields` - JSON string of fields to extract
- `tags` - JSON string of available tags for classification

**Example Request:**

```javascript
const formData = new FormData();
formData.append("resume", resumeFile);
formData.append(
  "extractionFields",
  JSON.stringify([
    { key: "name", label: "Full Name" },
    { key: "email", label: "Email Address" },
    { key: "phone", label: "Phone Number" },
    { key: "experience", label: "Years of Experience" },
  ])
);
formData.append(
  "tags",
  JSON.stringify([
    { name: "Frontend Developer" },
    { name: "React Developer" },
    { name: "JavaScript Developer" },
  ])
);

const response = await fetch("http://localhost:3000/api/analyze", {
  method: "POST",
  body: formData,
});
```

**Response (202 Accepted):**

```json
{
  "success": true,
  "message": "Resume analysis started successfully",
  "jobId": "job_1703123456789_abc123def",
  "status": "queued",
  "statusEndpoint": "/api/analyze-status/job_1703123456789_abc123def",
  "estimatedTime": "2-5 minutes",
  "instructions": "Use the status endpoint to check progress and get results"
}
```

---

### **2. Check Job Status**

```http
GET /api/analyze-status/{jobId}
```

**Description:** Check the progress and results of a resume analysis job.

**Parameters:**

- `jobId` - The job ID returned from the analyze endpoint

**Example Request:**

```javascript
const response = await fetch(
  `http://localhost:3000/api/analyze-status/job_1703123456789_abc123def`
);
const status = await response.json();
```

**Response Examples:**

#### **Queued Job:**

```json
{
  "jobId": "job_1703123456789_abc123def",
  "status": "queued",
  "progress": 0,
  "fileName": "resume.pdf",
  "fileSize": 245760,
  "createdAt": "2023-12-21T10:30:00.000Z",
  "updatedAt": "2023-12-21T10:30:00.000Z",
  "elapsedTime": "0m 15s",
  "estimatedTimeRemaining": "1m 45s"
}
```

#### **Processing Job:**

```json
{
  "jobId": "job_1703123456789_abc123def",
  "status": "processing",
  "progress": 45,
  "fileName": "resume.pdf",
  "fileSize": 245760,
  "createdAt": "2023-12-21T10:30:00.000Z",
  "updatedAt": "2023-12-21T10:32:00.000Z",
  "elapsedTime": "2m 0s",
  "estimatedTimeRemaining": "0m 0s"
}
```

#### **Completed Job:**

```json
{
  "jobId": "job_1703123456789_abc123def",
  "status": "completed",
  "progress": 100,
  "fileName": "resume.pdf",
  "fileSize": 245760,
  "createdAt": "2023-12-21T10:30:00.000Z",
  "updatedAt": "2023-12-21T10:34:00.000Z",
  "completedAt": "2023-12-21T10:34:00.000Z",
  "elapsedTime": "4m 0s",
  "result": {
    "summary": "Experienced frontend developer with 5+ years...",
    "extractedInformation": {
      "name": "John Doe",
      "email": "john.doe@email.com",
      "phone": "+1-555-0123",
      "experience": "5 years"
    },
    "assignedTags": ["Frontend Developer", "React Developer"],
    "analyzedAt": "2023-12-21T10:34:00.000Z"
  }
}
```

#### **Failed Job:**

```json
{
  "jobId": "job_1703123456789_abc123def",
  "status": "failed",
  "progress": 30,
  "fileName": "resume.pdf",
  "fileSize": 245760,
  "createdAt": "2023-12-21T10:30:00.000Z",
  "updatedAt": "2023-12-21T10:31:00.000Z",
  "elapsedTime": "1m 0s",
  "error": "Failed to parse PDF file - file may be corrupted"
}
```

---

## 🔄 **Complete Workflow Example**

```javascript
// 1. Start analysis
const startResponse = await fetch("http://localhost:3000/api/analyze", {
  method: "POST",
  body: formData,
});

if (startResponse.status === 202) {
  const { jobId } = await startResponse.json();

  // 2. Poll for status
  const pollInterval = setInterval(async () => {
    const statusResponse = await fetch(
      `http://localhost:3000/api/analyze-status/${jobId}`
    );
    const status = await statusResponse.json();

    console.log(`Progress: ${status.progress}% - ${status.status}`);

    if (status.status === "completed") {
      clearInterval(pollInterval);
      console.log("Analysis complete:", status.result);
    } else if (status.status === "failed") {
      clearInterval(pollInterval);
      console.error("Analysis failed:", status.error);
    }
  }, 2000); // Check every 2 seconds
}
```

---

## 📋 **Job Status Values**

| Status       | Description                     | Progress Range |
| ------------ | ------------------------------- | -------------- |
| `queued`     | Job is waiting to be processed  | 0%             |
| `processing` | Job is currently being analyzed | 10% - 90%      |
| `completed`  | Job finished successfully       | 100%           |
| `failed`     | Job encountered an error        | 0% - 100%      |

---

## ⚠️ **Important Notes**

### **No Authentication Required:**

- ✅ **Public API** - no API keys or tokens needed
- ✅ **Cross-origin requests** supported
- ✅ **Rate limiting** may apply (check response headers)

### **File Requirements:**

- ✅ **Supported formats:** PDF, DOCX
- ✅ **Maximum size:** 10MB
- ✅ **Text-based files** work best (avoid image-only PDFs)

### **Processing Time:**

- ⏱️ **Typical duration:** 2-5 minutes
- ⏱️ **Large files:** May take longer
- ⏱️ **Complex resumes:** More detailed analysis takes more time

---

## 🚨 **Error Handling**

### **Common HTTP Status Codes:**

- `202 Accepted` - Job started successfully
- `400 Bad Request` - Invalid input (missing file, wrong format)
- `413 Payload Too Large` - File exceeds 10MB limit
- `500 Internal Server Error` - Server-side processing error

### **Error Response Format:**

```json
{
  "error": "Error description",
  "details": "Additional error information"
}
```

---

## 🔧 **Integration Tips**

### **1. Polling Strategy:**

```javascript
// Recommended: Check every 2-3 seconds
const pollInterval = 2000; // 2 seconds

// For better UX, show progress updates
if (status.progress > 0) {
  updateProgressBar(status.progress);
}
```

### **2. Timeout Handling:**

```javascript
// Set reasonable timeout for status checks
const timeout = setTimeout(() => {
  clearInterval(pollInterval);
  console.log("Status check timeout");
}, 300000); // 5 minutes
```

### **3. Error Recovery:**

```javascript
if (status.status === "failed") {
  // Log error details
  console.error("Job failed:", status.error);

  // Optionally retry with same file
  // or notify user to try again
}
```

---

## 🌐 **CORS Support**

The API includes CORS headers for cross-origin requests:

- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: POST, GET, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

---

## 📞 **Support**

For questions or issues with the public API:

- Check the job status endpoint for detailed error messages
- Monitor the response headers for additional information
- Ensure your requests follow the documented format

---

**🎯 Ready to integrate!** Your external projects can now use these endpoints without any authentication setup.
