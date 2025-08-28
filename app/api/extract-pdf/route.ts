import { NextRequest, NextResponse } from "next/server";
import { parsePdfToText } from "../../../services/fileParserService";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Allow all origins
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400", // 24 hours
  "Cache-Control": "no-cache, no-store, must-revalidate",
};

// Handle preflight OPTIONS request
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// Configure for PDF processing
export const maxDuration = 60; // 1 minute for PDF processing
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Public API - no authentication required
    // Note: This endpoint is designed to be used by external projects

    // Check if the request is multipart/form-data
    if (!request.headers.get("content-type")?.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Request must be multipart/form-data" },
        { status: 400, headers: corsHeaders }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    // Validate required form data
    if (!file) {
      return NextResponse.json(
        { error: "No PDF file provided" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!(file instanceof Blob)) {
      return NextResponse.json(
        { error: "Invalid file format" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Get the file type from the Blob
    const fileType = file.type;

    // Check file type - only PDF allowed
    if (!fileType.includes("pdf")) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF files are supported" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check file size (limit to 10MB)
    const fileSize = file.size;
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (fileSize > maxSize) {
      return NextResponse.json(
        {
          error: "File size too large. Please upload a file smaller than 10MB.",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Convert file to buffer for processing
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Extract text from the PDF
    const extractedText = await parsePdfToText(fileBuffer);

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        {
          error:
            "Could not extract text from the PDF. Please ensure the file contains readable text.",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Return the extracted text
    return NextResponse.json(
      {
        success: true,
        message: "PDF text extraction completed successfully",
        data: {
          fileName: (file as File).name || "unknown",
          fileSize,
          fileType,
          extractedText,
          textLength: extractedText.length,
          wordCount: extractedText
            .split(/\s+/)
            .filter((word) => word.length > 0).length,
          extractedAt: new Date().toISOString(),
        },
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Error extracting PDF text:", error);

    return NextResponse.json(
      {
        error:
          "An error occurred while extracting text from the PDF. Please try again.",
        details: error.message,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
