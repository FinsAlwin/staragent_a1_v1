import { NextRequest, NextResponse } from "next/server";
import {
  parsePdfToText,
  parseDocxToText,
} from "../../../services/fileParserService";
import { analyzeResumeWithGemini } from "../../../services/geminiService";
import {
  type ExtractionField as ExtractionFieldType,
  type Tag as TagType,
} from "../../../types";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Allow all origins - you can restrict this to specific domains
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400", // 24 hours
  // Add timeout headers
  "X-Request-Timeout": "120000",
  "Cache-Control": "no-cache, no-store, must-revalidate",
};

// Handle preflight OPTIONS request
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// Configure for synchronous processing
export const maxDuration = 60; // 1 minute for processing (reduced from 2 minutes)
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
    const file = formData.get("resume");
    const extractionFieldsData = formData.get("extractionFields") as string;
    const tagsData = formData.get("tags") as string;

    // Validate required form data
    if (!file) {
      return NextResponse.json(
        { error: "No resume file provided" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!extractionFieldsData) {
      return NextResponse.json(
        { error: "No extraction fields provided" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!tagsData) {
      return NextResponse.json(
        { error: "No tags provided" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Parse extraction fields and tags from form data
    let extractionFields: ExtractionFieldType[] = [];
    let availableTags: TagType[] = [];

    try {
      extractionFields = JSON.parse(
        extractionFieldsData
      ) as ExtractionFieldType[];
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid extraction fields format. Must be valid JSON." },
        { status: 400, headers: corsHeaders }
      );
    }

    try {
      availableTags = JSON.parse(tagsData) as TagType[];
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid tags format. Must be valid JSON." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate that we have tags and extraction fields
    if (availableTags.length === 0) {
      return NextResponse.json(
        { error: "At least one tag must be provided" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (extractionFields.length === 0) {
      return NextResponse.json(
        { error: "At least one extraction field must be provided" },
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

    // Check file type
    if (!fileType.includes("pdf") && !fileType.includes("docx")) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF and DOCX files are supported" },
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

    // Extract text from the file
    let extractedText: string;

    if (fileType.includes("pdf")) {
      extractedText = await parsePdfToText(fileBuffer);
    } else if (fileType.includes("docx")) {
      extractedText = await parseDocxToText(fileBuffer);
    } else {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        {
          error:
            "Could not extract text from the file. Please ensure the file contains readable text.",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Analyze the resume with Gemini
    const analysisResult = await analyzeResumeWithGemini(
      extractedText,
      extractionFields,
      availableTags
    );

    // Return the analysis result immediately
    return NextResponse.json(
      {
        success: true,
        message: "Resume analysis completed successfully",
        result: analysisResult,
        fileName: (file as File).name || "unknown",
        fileSize,
        fileType,
        extractedTextLength: extractedText.length,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Error processing resume analysis:", error);

    return NextResponse.json(
      {
        error:
          "An error occurred while processing the resume. Please try again.",
        details: error.message,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
