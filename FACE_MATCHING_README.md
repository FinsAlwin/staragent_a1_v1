# AI Face Matching Feature

This document describes the AI Face Matching feature implementation in the AI Resume Analyzer application.

## Overview

The AI Face Matching feature uses Google's Gemini AI to analyze facial features in images and find similar faces in a database. It provides both a public API for face matching and an admin panel for managing the face database.

## Features

### Public API

- **Face Matching Endpoint**: `/api/face-matching/match`
- Accepts image uploads and returns similarity results
- No authentication required
- CORS enabled for cross-origin requests

### Admin Panel

- **Face Database Management**: `/admin/face-matching`
- Upload and manage stored face images
- Test face matching functionality
- View and delete stored images

### Public Demo

- **Demo Page**: `/face-matching`
- Public interface for testing face matching
- User-friendly design with real-time results

## API Endpoints

### Public Face Matching API

#### POST `/api/face-matching/match`

Matches an uploaded image against the face database.

**Request Body:**

```json
{
  "image": "base64_encoded_image_string",
  "mimeType": "image/jpeg"
}
```

**Response:**

```json
{
  "uploadedImageDescription": "AI-generated description of the face",
  "matches": [
    {
      "id": "person1",
      "similarityScore": 0.85
    }
  ],
  "processingTime": 1250,
  "message": "Found 1 similar face(s)"
}
```

### Admin API Endpoints

#### GET `/api/admin/face-matching/images`

Retrieves all stored face images.

#### POST `/api/admin/face-matching/images`

Adds a new face image to the database.

**Request Body:**

```json
{
  "name": "John Doe",
  "image": "base64_encoded_image_string",
  "mimeType": "image/jpeg",
  "uploadedBy": "admin"
}
```

#### GET `/api/admin/face-matching/images/[id]`

Retrieves a specific stored image.

#### PUT `/api/admin/face-matching/images/[id]`

Updates a stored image.

#### DELETE `/api/admin/face-matching/images/[id]`

Soft deletes a stored image (sets isActive to false).

## Database Schema

### StoredImage Model

```typescript
interface IStoredImage {
  name: string;
  description: string; // AI-generated description
  imageUrl: string; // Base64 encoded image
  uploadedAt: Date;
  uploadedBy: string;
  isActive: boolean;
}
```

## AI Service

The face matching service uses Google's Gemini AI with the following functions:

### `getImageDescription(base64Image, mimeType)`

- Analyzes an image and generates a detailed facial description
- Focuses on unique identifiers like eye shape, nose structure, etc.
- Returns "No clear human face detected" if no face is found

### `findSimilarFaces(uploadedImageDescription)`

- Compares the uploaded image description against stored descriptions
- Uses AI to calculate similarity scores (0.0 to 1.0)
- Returns matches with similarity scores > 0.5

## Configuration

### Environment Variables

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=your_mongodb_connection_string
```

### Constants

- `GEMINI_TEXT_MODEL`: "gemini-1.5-flash"
- `PRE_STORED_IMAGES`: Array of sample face data for testing

## Usage Examples

### Using the Public API

```javascript
const response = await fetch("/api/face-matching/match", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    image: base64Image,
    mimeType: "image/jpeg",
  }),
});

const result = await response.json();
console.log("Matches:", result.matches);
```

### Using the Admin API

```javascript
// Upload a new face
const response = await fetch("/api/admin/face-matching/images", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Jane Smith",
    image: base64Image,
    mimeType: "image/jpeg",
    uploadedBy: "admin",
  }),
});
```

## Security Considerations

1. **Image Validation**: Only accepts image MIME types
2. **Face Detection**: Validates that uploaded images contain human faces
3. **Admin Authentication**: Admin endpoints require authentication
4. **CORS**: Public API supports cross-origin requests
5. **Rate Limiting**: Consider implementing rate limiting for production

## Performance

- **Processing Time**: Typically 1-3 seconds per image
- **Database**: Uses MongoDB for scalable storage
- **Caching**: Consider implementing Redis for frequently accessed data
- **Image Storage**: Currently stores base64, consider cloud storage for production

## Future Enhancements

1. **Cloud Storage**: Integrate with AWS S3 or similar for image storage
2. **Face Embeddings**: Store numerical face embeddings for faster matching
3. **Batch Processing**: Support for multiple image uploads
4. **Advanced Filtering**: Add filters for age, gender, etc.
5. **API Rate Limiting**: Implement proper rate limiting
6. **Webhook Support**: Notify external systems of matches
7. **Analytics Dashboard**: Track usage and performance metrics

## Troubleshooting

### Common Issues

1. **"No clear human face detected"**

   - Ensure the image contains a clear, front-facing human face
   - Check image quality and lighting

2. **"API key is not set"**

   - Verify the NEXT_PUBLIC_GEMINI_API_KEY environment variable is set
   - Check that the Gemini API key is valid

3. **"Failed to process face matching request"**
   - Check server logs for detailed error information
   - Verify image format and size

### Debug Mode

Enable debug logging by setting the environment variable:

```env
DEBUG=true
```

## Support

For technical support or questions about the AI Face Matching feature, please contact the development team or create an issue in the project repository.
