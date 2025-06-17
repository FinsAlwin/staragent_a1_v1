import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get all environment variables
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI: process.env.MONGODB_URI,
      JWT_SECRET: process.env.JWT_SECRET,
      NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    };

    // Check if MONGODB_URI exists and its properties
    const mongoUri = process.env.MONGODB_URI;
    const mongoUriInfo = {
      exists: !!mongoUri,
      type: typeof mongoUri,
      length: mongoUri?.length,
      startsWith: mongoUri?.substring(0, 20) + "...",
      hasQuotes: mongoUri?.startsWith('"') || mongoUri?.startsWith("'"),
      cleanStart:
        mongoUri?.replace(/^["']|["']$/g, "").substring(0, 20) + "...",
    };

    // Test the exact same logic as lib/db.ts
    let testMongoUri = process.env.MONGODB_URI;
    let testResult = {
      step1: "not tested",
      step2: "not tested",
      step3: "not tested",
    };

    try {
      // Step 1: Check if exists
      if (!testMongoUri) {
        testResult.step1 = "failed - not defined";
      } else {
        testResult.step1 = "passed";
      }

      // Step 2: Remove quotes
      if (testMongoUri) {
        testMongoUri = testMongoUri.replace(/^["']|["']$/g, "");
        testResult.step2 = "passed";
      } else {
        testResult.step2 = "skipped - no URI";
      }

      // Step 3: Validate format
      if (testMongoUri) {
        if (
          !testMongoUri.startsWith("mongodb://") &&
          !testMongoUri.startsWith("mongodb+srv://")
        ) {
          testResult.step3 = "failed - invalid format";
        } else {
          testResult.step3 = "passed";
        }
      } else {
        testResult.step3 = "skipped - no URI";
      }
    } catch (error: any) {
      testResult.step1 = `error: ${error.message}`;
    }

    return NextResponse.json({
      success: true,
      message: "Environment variables test",
      envVars,
      mongoUriInfo,
      testResult,
      timestamp: new Date().toISOString(),
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
