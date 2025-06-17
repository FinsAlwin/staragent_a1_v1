import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Step 1: Basic response test
    return NextResponse.json({
      success: true,
      message: "Basic route working",
      timestamp: new Date().toISOString(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        HAS_MONGODB_URI: !!process.env.MONGODB_URI,
        HAS_JWT_SECRET: !!process.env.JWT_SECRET,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        errorType: error.constructor.name,
      },
      { status: 500 }
    );
  }
}
