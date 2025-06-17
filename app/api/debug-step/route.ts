import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const results = {
      step1: {
        name: "Environment Variables Check",
        status: "testing...",
        details: {},
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

    // Step 1: Check environment variables
    try {
      const mongoUri = process.env.MONGODB_URI;
      const cleanMongoUri = mongoUri?.replace(/^["']|["']$/g, "");

      results.step1.details = {
        NODE_ENV: process.env.NODE_ENV,
        JWT_SECRET_EXISTS: !!process.env.JWT_SECRET,
        JWT_SECRET_LENGTH: process.env.JWT_SECRET?.length,
        MONGODB_URI_EXISTS: !!process.env.MONGODB_URI,
        MONGODB_URI_START: mongoUri?.substring(0, 20) + "...",
        MONGODB_URI_HAS_QUOTES:
          mongoUri?.startsWith('"') || mongoUri?.startsWith("'"),
        MONGODB_URI_CLEAN_START: cleanMongoUri?.substring(0, 20) + "...",
        GEMINI_API_KEY_EXISTS: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
        GEMINI_API_KEY_LENGTH: process.env.NEXT_PUBLIC_GEMINI_API_KEY?.length,
      };
      results.step1.status = "passed";
    } catch (error: any) {
      results.step1.status = "failed";
      results.step1.details = { error: error.message };
    }

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
