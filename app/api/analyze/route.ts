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
};

// Handle preflight OPTIONS request
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(request: NextRequest) {
  try {
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

    // Convert Blob to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Extract text from the resume
    let resumeText = "";
    if (fileType.includes("pdf")) {
      resumeText = await parsePdfToText(arrayBuffer);
    } else {
      resumeText = await parseDocxToText(arrayBuffer);
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

    // Analyze the resume
    const result = await analyzeResumeWithGemini(
      resumeText,
      extractionFields,
      availableTags
    );

    const analysisResult = {
      ...result,
      analyzedAt: new Date().toISOString(),
    };

    return NextResponse.json(analysisResult, {
      headers: corsHeaders,
    });
  } catch (error: any) {
    console.error("Error processing resume:", error);
    return NextResponse.json(
      {
        error: error.message || "An error occurred while processing the resume",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
