import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";

export async function GET(request: NextRequest) {
  try {
    const envInfo = {
      // Environment variables
      NODE_ENV: process.env.NODE_ENV,
      JWT_SECRET_EXISTS: !!process.env.NEXT_PUBLIC_JWT_SECRET,
      JWT_SECRET_LENGTH: process.env.NEXT_PUBLIC_JWT_SECRET?.length,
      MONGODB_URI_EXISTS: !!process.env.NEXT_PUBLIC_MONGODB_URI,
      MONGODB_URI_START:
        process.env.NEXT_PUBLIC_MONGODB_URI?.substring(0, 20) + "...",
      GEMINI_API_KEY_EXISTS: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      GEMINI_API_KEY_LENGTH: process.env.NEXT_PUBLIC_GEMINI_API_KEY?.length,

      // AWS variables (optional)
      AWS_REGION: process.env.AWS_REGION,
      AWS_ACCESS_KEY_ID_EXISTS: !!process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY_EXISTS: !!process.env.AWS_SECRET_ACCESS_KEY,
      AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,

      // Build info
      BUILD_TIME: new Date().toISOString(),
      PLATFORM: process.platform,
      NODE_VERSION: process.version,
    };

    // Test database connection
    let dbStatus = "Not tested";
    try {
      await connectDB();
      dbStatus = "Connected successfully";
    } catch (dbError: any) {
      dbStatus = `Failed: ${dbError.message}`;
    }

    return NextResponse.json({
      success: true,
      environment: envInfo,
      database: dbStatus,
      message: "Debug information retrieved successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
