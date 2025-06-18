import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: "Simple API route working",
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
      basicEnvVars: {
        NODE_ENV: process.env.NODE_ENV,
        JWT_SECRET_EXISTS: !!process.env.NEXT_PUBLIC_JWT_SECRET,
        MONGODB_URI_EXISTS: !!process.env.NEXT_PUBLIC_MONGODB_URI,
      },
      HAS_MONGODB_URI: !!process.env.NEXT_PUBLIC_MONGODB_URI,
      GEMINI_API_KEY_EXISTS: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
