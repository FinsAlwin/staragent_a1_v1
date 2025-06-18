import { NextRequest, NextResponse } from "next/server";
import {
  getImageDescription,
  findSimilarFaces,
  isApiKeySet,
} from "../../../../services/faceMatchingService";

export async function POST(request: NextRequest) {
  try {
    // Check if API key is set
    if (!isApiKeySet()) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;
    const imageUrl = formData.get("imageUrl") as string;
    const mimeType = formData.get("mimeType") as string;

    let base64Image: string;
    let finalMimeType: string;

    // Check if image is provided as file or URL
    if (imageFile && imageFile.size > 0) {
      // Handle file upload
      if (!mimeType) {
        return NextResponse.json(
          { error: "Missing required field: mimeType" },
          { status: 400 }
        );
      }

      // Validate file type
      if (!mimeType.startsWith("image/")) {
        return NextResponse.json(
          { error: "Invalid file type. Must be an image." },
          { status: 400 }
        );
      }

      // Validate file size (max 10MB)
      if (imageFile.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Image file too large. Maximum size is 10MB." },
          { status: 400 }
        );
      }

      // Convert file to base64
      const arrayBuffer = await imageFile.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);
      base64Image = imageBuffer.toString("base64");
      finalMimeType = mimeType;
    } else if (imageUrl && imageUrl.trim()) {
      // Handle image URL
      try {
        // Fetch image from URL
        const response = await fetch(imageUrl);
        if (!response.ok) {
          return NextResponse.json(
            {
              error: `Failed to fetch image from URL: ${response.status} ${response.statusText}`,
            },
            { status: 400 }
          );
        }

        // Get content type from response
        const contentType = response.headers.get("content-type");

        // More flexible content type validation
        let isValidImage = false;
        if (contentType) {
          isValidImage = contentType.startsWith("image/");
        }

        // If content type is not image/* or is generic (like application/octet-stream), check URL extension
        if (!isValidImage || contentType === "application/octet-stream") {
          const url = new URL(imageUrl);
          const pathname = url.pathname.toLowerCase();
          const imageExtensions = [
            ".jpg",
            ".jpeg",
            ".png",
            ".gif",
            ".bmp",
            ".webp",
            ".svg",
          ];
          isValidImage = imageExtensions.some((ext) => pathname.endsWith(ext));
        }

        if (!isValidImage) {
          return NextResponse.json(
            {
              error: `Invalid image URL. Content-Type: ${
                contentType || "unknown"
              }. URL must point to an image file.`,
            },
            { status: 400 }
          );
        }

        // Convert to base64
        const arrayBuffer = await response.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);
        base64Image = imageBuffer.toString("base64");

        // Determine mime type intelligently
        let determinedMimeType = contentType;
        if (
          !determinedMimeType ||
          determinedMimeType === "application/octet-stream"
        ) {
          // Try to determine from URL extension
          const url = new URL(imageUrl);
          const pathname = url.pathname.toLowerCase();

          if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) {
            determinedMimeType = "image/jpeg";
          } else if (pathname.endsWith(".png")) {
            determinedMimeType = "image/png";
          } else if (pathname.endsWith(".gif")) {
            determinedMimeType = "image/gif";
          } else if (pathname.endsWith(".bmp")) {
            determinedMimeType = "image/bmp";
          } else if (pathname.endsWith(".webp")) {
            determinedMimeType = "image/webp";
          } else if (pathname.endsWith(".svg")) {
            determinedMimeType = "image/svg+xml";
          } else {
            // Default to jpeg if we can't determine
            determinedMimeType = "image/jpeg";
          }
        }

        finalMimeType = determinedMimeType;

        // Validate file size (max 10MB)
        if (imageBuffer.length > 10 * 1024 * 1024) {
          return NextResponse.json(
            { error: "Image file too large. Maximum size is 10MB." },
            { status: 400 }
          );
        }
      } catch (error) {
        console.error("Error fetching image from URL:", error);
        return NextResponse.json(
          {
            error: `Failed to process image URL: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        {
          error:
            "Missing required field: either 'image' (file) or 'imageUrl' (URL)",
        },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Get AI description of the uploaded image
    const uploadedImageDescription = await getImageDescription(
      base64Image,
      finalMimeType
    );

    // Check if a face was detected
    if (
      uploadedImageDescription
        .toLowerCase()
        .includes("no clear human face detected")
    ) {
      return NextResponse.json(
        { error: "No clear human face detected in the uploaded image" },
        { status: 400 }
      );
    }

    // Find similar faces
    const matches = await findSimilarFaces(uploadedImageDescription);

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      uploadedImageDescription,
      matches,
      processingTime,
    });
  } catch (error: any) {
    console.error("Error in face matching:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process face matching" },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
