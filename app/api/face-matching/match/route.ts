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
    const mimeType = formData.get("mimeType") as string;

    if (!imageFile || !mimeType) {
      return NextResponse.json(
        { error: "Missing required fields: image, mimeType" },
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

    const startTime = Date.now();

    // Convert image to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
    const base64Image = imageBuffer.toString("base64");

    // Get AI description of the uploaded image
    const uploadedImageDescription = await getImageDescription(
      base64Image,
      mimeType
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
