import { NextRequest, NextResponse } from "next/server";
import { analyzeResumeWithGemini } from "../../../services/geminiService";
import {
  type ExtractionField as ExtractionFieldType,
  type Tag as TagType,
} from "../../../types";

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

// Configure for resume analysis
export const maxDuration = 60; // 1 minute for analysis (reduced from 2 minutes)
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Public API - no authentication required
    // Note: This endpoint is designed to be used by external projects

    // Check if the request is JSON
    if (!request.headers.get("content-type")?.includes("application/json")) {
      return NextResponse.json(
        { error: "Request must be application/json" },
        { status: 400, headers: corsHeaders }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.extractedText) {
      return NextResponse.json(
        { error: "extractedText is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!body.extractionFields) {
      return NextResponse.json(
        { error: "extractionFields is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!body.tags) {
      return NextResponse.json(
        { error: "tags is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate that we have tags and extraction fields
    if (!Array.isArray(body.tags) || body.tags.length === 0) {
      return NextResponse.json(
        { error: "At least one tag must be provided" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (
      !Array.isArray(body.extractionFields) ||
      body.extractionFields.length === 0
    ) {
      return NextResponse.json(
        { error: "At least one extraction field must be provided" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate extracted text
    if (
      typeof body.extractedText !== "string" ||
      body.extractedText.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "extractedText must be a non-empty string" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Parse and validate extraction fields and tags
    let extractionFields: ExtractionFieldType[];
    let availableTags: TagType[];

    try {
      extractionFields = body.extractionFields as ExtractionFieldType[];
      availableTags = body.tags as TagType[];
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid extraction fields or tags format" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Analyze the resume with Gemini
    const analysisResult = await analyzeResumeWithGemini(
      body.extractedText,
      extractionFields,
      availableTags
    );

    // Return the analysis result
    return NextResponse.json(
      {
        success: true,
        message: "Resume analysis completed successfully",
        result: analysisResult,
        fileName: body.fileName || "unknown",
        fileSize: body.fileSize || 0,
        fileType: body.fileType || "text/plain",
        extractedTextLength: body.extractedText.length,
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
