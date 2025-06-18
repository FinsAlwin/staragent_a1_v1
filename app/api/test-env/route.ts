import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Test all environment variables
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_JWT_SECRET: process.env.NEXT_PUBLIC_JWT_SECRET
        ? "Defined"
        : "Undefined",
      NEXT_PUBLIC_MONGODB_URI: process.env.NEXT_PUBLIC_MONGODB_URI
        ? "Defined"
        : "Undefined",
      NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY
        ? "Defined"
        : "Undefined",
      NEXT_PUBLIC_CUSTOM_KEY: process.env.NEXT_PUBLIC_CUSTOM_KEY
        ? "Defined"
        : "Undefined",
    };

    // Test if we can access process.env directly
    const allEnvKeys = Object.keys(process.env).filter(
      (key) =>
        key.includes("JWT") ||
        key.includes("MONGO") ||
        key.includes("GEMINI") ||
        key.includes("CUSTOM")
    );

    // Test environment variable loading timing
    const testResults = {
      timestamp: new Date().toISOString(),
      route: "/api/test-env",
      envVars,
      allEnvKeys,
      processEnvKeys: Object.keys(process.env).length,
      hasProcessEnv: typeof process.env !== "undefined",
    };

    return NextResponse.json({
      success: true,
      message: "Environment variable test",
      ...testResults,
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
