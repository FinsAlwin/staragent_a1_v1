import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const results = {
      step1: {
        name: "Environment Variables",
        status: "completed",
        error: null,
        data: {
          NODE_ENV: process.env.NODE_ENV,
          MONGODB_URI_EXISTS: !!process.env.NEXT_PUBLIC_MONGODB_URI,
          JWT_SECRET_EXISTS: !!process.env.NEXT_PUBLIC_JWT_SECRET,
          JWT_SECRET_LENGTH: process.env.NEXT_PUBLIC_JWT_SECRET?.length,
          GEMINI_API_KEY_EXISTS: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
        },
      },
      step2: {
        name: "Database Connection Test",
        status: "not tested",
        details: {},
      },
      step3: {
        name: "Gemini API Test",
        status: "not tested",
        details: {},
      },
    };

    // Step 1: Environment variables
    const mongoUri = process.env.NEXT_PUBLIC_MONGODB_URI;
    const jwtSecret = process.env.NEXT_PUBLIC_JWT_SECRET;
    const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    results.step1.data = {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI_EXISTS: !!process.env.NEXT_PUBLIC_MONGODB_URI,
      JWT_SECRET_EXISTS: !!process.env.NEXT_PUBLIC_JWT_SECRET,
      JWT_SECRET_LENGTH: process.env.NEXT_PUBLIC_JWT_SECRET?.length,
      GEMINI_API_KEY_EXISTS: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    };

    // Step 2: Test database connection
    try {
      const { default: connectDB } = await import("../../../lib/db");
      await connectDB();
      results.step2.status = "passed";
      results.step2.details = { message: "Database connected successfully" };
    } catch (error: any) {
      results.step2.status = "failed";
      results.step2.details = {
        error: error.message,
        errorType: error.constructor.name,
      };
    }

    // Step 3: Test Gemini API (basic check)
    try {
      if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        results.step3.status = "skipped";
        results.step3.details = { message: "No Gemini API key provided" };
      } else {
        results.step3.status = "passed";
        results.step3.details = { message: "Gemini API key exists" };
      }
    } catch (error: any) {
      results.step3.status = "failed";
      results.step3.details = { error: error.message };
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
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
