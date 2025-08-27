import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/db";
import AnalysisJob from "../../../../models/AnalysisJob";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
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

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
): Promise<NextResponse> {
  try {
    await dbConnect();

    const { jobId } = params;

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Find the job
    const job = await AnalysisJob.findOne({ jobId }).lean();

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    // Calculate elapsed time with type assertion
    const jobData = job as any;
    const createdAt = jobData.createdAt || new Date();
    const elapsedTime = Date.now() - new Date(createdAt).getTime();
    const elapsedMinutes = Math.floor(elapsedTime / 60000);
    const elapsedSeconds = Math.floor((elapsedTime % 60000) / 1000);

    // Prepare response based on status
    const response: any = {
      jobId: jobData.jobId,
      status: jobData.status,
      progress: jobData.progress,
      fileName: jobData.fileName,
      fileSize: jobData.fileSize,
      createdAt: jobData.createdAt,
      updatedAt: jobData.updatedAt,
      elapsedTime: `${elapsedMinutes}m ${elapsedSeconds}s`,
    };

    // Add result if completed
    if (jobData.status === "completed" && jobData.result) {
      response.result = jobData.result;
      response.completedAt = jobData.completedAt;
    }

    // Add error if failed
    if (jobData.status === "failed" && jobData.error) {
      response.error = jobData.error;
    }

    // Add estimated remaining time for processing jobs
    if (jobData.status === "processing" || jobData.status === "queued") {
      const estimatedTotalTime = 120000; // 2 minutes
      const remainingTime = Math.max(0, estimatedTotalTime - elapsedTime);
      const remainingMinutes = Math.floor(remainingTime / 60000);
      const remainingSeconds = Math.floor((remainingTime % 60000) / 1000);
      response.estimatedTimeRemaining = `${remainingMinutes}m ${remainingSeconds}s`;
    }

    return NextResponse.json(response, {
      headers: corsHeaders,
    });
  } catch (error: any) {
    console.error("Error fetching job status:", error);
    return NextResponse.json(
      {
        error: "An error occurred while fetching job status. Please try again.",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
