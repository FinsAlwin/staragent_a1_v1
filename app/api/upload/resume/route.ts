import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import {
  parsePdfToText,
  parseDocxToText,
} from "../../../../services/fileParserService";
import { analyzeResumeWithGemini } from "../../../../services/geminiService";
import dbConnect from "../../../../lib/db";
import Tag from "../../../../models/Tag";
import ExtractionField from "../../../../models/ExtractionField";
import {
  type ExtractionField as ExtractionFieldType,
  type Tag as TagType,
} from "../../../../types";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const payload = await verifyAuth(request);
    if (!payload) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if the request is multipart/form-data
    if (!request.headers.get("content-type")?.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Request must be multipart/form-data" },
        { status: 400 }
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
        { status: 400 }
      );
    }

    if (!extractionFieldsData) {
      return NextResponse.json(
        { error: "No extraction fields provided" },
        { status: 400 }
      );
    }

    if (!tagsData) {
      return NextResponse.json({ error: "No tags provided" }, { status: 400 });
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
        { status: 400 }
      );
    }

    try {
      availableTags = JSON.parse(tagsData) as TagType[];
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid tags format. Must be valid JSON." },
        { status: 400 }
      );
    }

    // Validate that we have tags and extraction fields
    if (availableTags.length === 0) {
      return NextResponse.json(
        { error: "At least one tag must be provided" },
        { status: 400 }
      );
    }

    if (extractionFields.length === 0) {
      return NextResponse.json(
        { error: "At least one extraction field must be provided" },
        { status: 400 }
      );
    }

    if (!(file instanceof Blob)) {
      return NextResponse.json(
        { error: "Invalid file format" },
        { status: 400 }
      );
    }

    // Get the file type from the Blob
    const fileType = file.type;

    // Check file type
    if (!fileType.includes("pdf") && !fileType.includes("docx")) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF and DOCX files are supported" },
        { status: 400 }
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
        { status: 400 }
      );
    }

    // Analyze the resume using Gemini
    const result = await analyzeResumeWithGemini(
      resumeText,
      extractionFields,
      availableTags
    );

    const analysisResult = {
      ...result,
      analyzedAt: new Date().toISOString(),
      userId: payload.userId,
    };

    return NextResponse.json(analysisResult);
  } catch (error: any) {
    console.error("Error processing resume:", error);

    // Provide more specific error messages
    let errorMessage = "An error occurred while processing the resume";
    let statusCode = 500;

    if (error.message.includes("JSON")) {
      errorMessage =
        "AI analysis failed due to response format issues. Please try again.";
      statusCode = 422;
    } else if (error.message.includes("API Key")) {
      errorMessage = "AI service configuration error. Please contact support.";
      statusCode = 503;
    } else if (error.message.includes("file")) {
      errorMessage = error.message;
      statusCode = 400;
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
