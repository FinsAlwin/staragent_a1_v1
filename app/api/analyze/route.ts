import { NextRequest, NextResponse } from "next/server";
import {
  parsePdfToText,
  parseDocxToText,
} from "../../../services/fileParserService";
import { analyzeResumeWithGemini } from "../../../services/geminiService";
import dbConnect from "../../../lib/db";
import Tag from "../../../models/Tag";
import ExtractionField from "../../../models/ExtractionField";
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

// Configure timeout for this route
export const maxDuration = 120; // 2 minutes
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Set a timeout for the entire request
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Request timeout")), 120000); // 2 minutes
  });

  try {
    // Race between the actual processing and timeout
    const result = await Promise.race([
      processResumeAnalysis(request),
      timeoutPromise,
    ]);

    return result;
  } catch (error: any) {
    if (error.message === "Request timeout") {
      return NextResponse.json(
        {
          error:
            "Request timed out. Please try with a smaller file or contact support.",
        },
        {
          status: 408,
          headers: corsHeaders,
        }
      );
    }

    console.error("Unexpected error processing resume:", error);
    return NextResponse.json(
      {
        error:
          "An unexpected error occurred while processing the resume. Please try again.",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

async function processResumeAnalysis(
  request: NextRequest
): Promise<NextResponse> {
  // Check if the request is multipart/form-data
  if (!request.headers.get("content-type")?.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Request must be multipart/form-data" },
      {
        status: 400,
        headers: corsHeaders,
      }
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
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  if (!extractionFieldsData) {
    return NextResponse.json(
      { error: "No extraction fields provided" },
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  if (!tagsData) {
    return NextResponse.json(
      { error: "No tags provided" },
      {
        status: 400,
        headers: corsHeaders,
      }
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
    console.error("Failed to parse extraction fields:", error);
    console.error("Raw extraction fields data:", extractionFieldsData);
    return NextResponse.json(
      { error: "Invalid extraction fields format. Must be valid JSON." },
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  try {
    availableTags = JSON.parse(tagsData) as TagType[];
  } catch (error) {
    console.error("Failed to parse tags:", error);
    console.error("Raw tags data:", tagsData);
    return NextResponse.json(
      { error: "Invalid tags format. Must be valid JSON." },
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  // Validate that we have tags and extraction fields
  if (availableTags.length === 0) {
    return NextResponse.json(
      { error: "At least one tag must be provided" },
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  if (extractionFields.length === 0) {
    return NextResponse.json(
      { error: "At least one extraction field must be provided" },
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  if (!(file instanceof Blob)) {
    return NextResponse.json(
      { error: "Invalid file format" },
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  // Get the file type from the Blob
  const fileType = file.type;

  // Check file type
  if (!fileType.includes("pdf") && !fileType.includes("docx")) {
    return NextResponse.json(
      { error: "Invalid file type. Only PDF and DOCX files are supported" },
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  // Check file size (limit to 10MB to prevent timeouts)
  const fileSize = file.size;
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (fileSize > maxSize) {
    return NextResponse.json(
      { error: "File size too large. Please upload a file smaller than 10MB." },
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  // Convert Blob to ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  // Extract text from the resume
  let resumeText = "";
  try {
    if (fileType.includes("pdf")) {
      resumeText = await parsePdfToText(arrayBuffer);
    } else {
      resumeText = await parseDocxToText(arrayBuffer);
    }
  } catch (parseError) {
    console.error("Error parsing file:", parseError);
    return NextResponse.json(
      {
        error:
          "Failed to parse the uploaded file. Please ensure it's a valid PDF or DOCX file.",
      },
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  if (!resumeText.trim()) {
    return NextResponse.json(
      {
        error:
          "Could not extract text from the resume. The file might be corrupted or image-based.",
      },
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  console.log(
    `Processing resume with ${extractionFields.length} fields and ${availableTags.length} tags`
  );
  console.log(`Extracted text length: ${resumeText.length} characters`);

  // Analyze the resume
  let result;
  try {
    result = await analyzeResumeWithGemini(
      resumeText,
      extractionFields,
      availableTags
    );
  } catch (analysisError: any) {
    console.error("Gemini analysis error:", analysisError);

    let errorMessage = "AI analysis failed";
    let statusCode = 500;

    if (analysisError.message.includes("JSON")) {
      errorMessage =
        "AI analysis failed due to response format issues. Please try again.";
      statusCode = 422;
    } else if (analysisError.message.includes("API Key")) {
      errorMessage = "AI service configuration error. Please contact support.";
      statusCode = 503;
    } else if (analysisError.message.includes("retry")) {
      errorMessage =
        "AI analysis is temporarily unavailable. Please try again in a few moments.";
      statusCode = 503;
    }

    return NextResponse.json(
      { error: errorMessage },
      {
        status: statusCode,
        headers: corsHeaders,
      }
    );
  }

  const analysisResult = {
    ...result,
    analyzedAt: new Date().toISOString(),
  };

  console.log("Analysis completed successfully");
  return NextResponse.json(analysisResult, {
    headers: corsHeaders,
  });
}
