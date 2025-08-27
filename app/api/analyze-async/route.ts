import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import dbConnect from "../../../lib/db";
import AnalysisJob from "../../../models/AnalysisJob";
import {
  type ExtractionField as ExtractionFieldType,
  type Tag as TagType,
} from "../../../types";
import { jobProcessor } from "../../../services/jobProcessor";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

// Handle preflight OPTIONS request
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// Configure timeout for this route - keep it short since we return immediately
export const maxDuration = 30; // 30 seconds
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Connect to database
    await dbConnect();

    // Verify authentication (optional)
    let userId: string | undefined;
    try {
      const payload = await verifyAuth(request);
      userId = payload?.userId as string | undefined;
    } catch (error) {
      // Continue without auth for demo purposes
      console.log("No authentication provided");
    }

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

    // Validate file
    if (!(file instanceof Blob)) {
      return NextResponse.json(
        { error: "Invalid file format" },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const fileType = file.type;
    const fileSize = file.size;
    const fileName = (file as File).name || "resume";

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

    // Check file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (fileSize > maxSize) {
      return NextResponse.json(
        {
          error: "File size too large. Please upload a file smaller than 10MB.",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Generate unique job ID
    const jobId = `job_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Convert file to buffer for processing
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Create job record
    const job = await AnalysisJob.create({
      jobId,
      userId,
      fileName,
      fileSize,
      fileType,
      status: "queued",
      progress: 0,
      extractionFields,
      tags: availableTags,
    });

    // Start processing immediately (but don't wait for completion)
    // In a production environment, you might use a proper job queue like Redis/Bull
    setImmediate(async () => {
      try {
        await jobProcessor.processJob({
          jobId,
          fileBuffer,
          fileType,
          extractionFields,
          tags: availableTags,
        });
      } catch (error) {
        console.error(`Background processing failed for job ${jobId}:`, error);
      }
    });

    // Return immediately with job ID
    return NextResponse.json(
      {
        jobId,
        status: "queued",
        message: "Resume analysis started. Use the job ID to check progress.",
        estimatedTime: "2-5 minutes",
        checkStatusUrl: `/api/analyze-status/${jobId}`,
      },
      {
        headers: corsHeaders,
      }
    );
  } catch (error: any) {
    console.error("Error creating analysis job:", error);
    return NextResponse.json(
      {
        error:
          "An error occurred while starting the analysis. Please try again.",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
