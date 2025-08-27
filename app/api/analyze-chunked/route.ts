import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import {
  parsePdfToText,
  parseDocxToText,
} from "../../../services/fileParserService";
import {
  type ExtractionField as ExtractionFieldType,
  type Tag as TagType,
} from "../../../types";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export const maxDuration = 30; // Keep short for initial response
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Quick validation and text extraction only
    // Return extracted text for client-side AI processing

    const formData = await request.formData();
    const file = formData.get("resume");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "No valid file provided" },
        { status: 400, headers: corsHeaders }
      );
    }

    const fileType = file.type;
    const fileSize = file.size;

    // Basic validation
    if (!fileType.includes("pdf") && !fileType.includes("docx")) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF and DOCX files are supported" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (fileSize > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: "File size too large. Please upload a file smaller than 10MB.",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Quick text extraction
    const arrayBuffer = await file.arrayBuffer();
    let resumeText = "";

    if (fileType.includes("pdf")) {
      resumeText = await parsePdfToText(arrayBuffer);
    } else {
      resumeText = await parseDocxToText(arrayBuffer);
    }

    if (!resumeText.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from the resume" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Return extracted text for client-side processing
    return NextResponse.json(
      {
        success: true,
        resumeText,
        fileInfo: {
          name: (file as File).name,
          size: fileSize,
          type: fileType,
        },
        message: "Text extracted successfully. Ready for AI analysis.",
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Error in chunked processing:", error);
    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500, headers: corsHeaders }
    );
  }
}
