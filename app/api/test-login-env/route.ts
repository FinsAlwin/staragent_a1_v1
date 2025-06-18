import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Test environment variables in the same context as login route
    console.log("=== LOGIN ENV TEST ===");
    console.log("Route: /api/test-login-env");
    console.log("Timestamp:", new Date().toISOString());
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log(
      "NEXT_PUBLIC_JWT_SECRET:",
      process.env.NEXT_PUBLIC_JWT_SECRET ? "Defined" : "Undefined"
    );
    console.log(
      "NEXT_PUBLIC_MONGODB_URI:",
      process.env.NEXT_PUBLIC_MONGODB_URI ? "Defined" : "Undefined"
    );
    console.log(
      "NEXT_PUBLIC_GEMINI_API_KEY:",
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ? "Defined" : "Undefined"
    );

    // Try different ways to access environment variables
    const envVars = {
      direct: {
        JWT_SECRET: process.env.NEXT_PUBLIC_JWT_SECRET,
        MONGODB_URI: process.env.NEXT_PUBLIC_MONGODB_URI,
      },
      viaObject: {
        JWT_SECRET: (process.env as any).NEXT_PUBLIC_JWT_SECRET,
        MONGODB_URI: (process.env as any).NEXT_PUBLIC_MONGODB_URI,
      },
      allKeys: Object.keys(process.env).filter(
        (key) =>
          key.includes("JWT") || key.includes("MONGO") || key.includes("GEMINI")
      ),
    };

    console.log(
      "Environment variable test results:",
      JSON.stringify(envVars, null, 2)
    );
    console.log("=== END LOGIN ENV TEST ===");

    return NextResponse.json({
      success: true,
      message: "Login environment test",
      route: "/api/test-login-env",
      timestamp: new Date().toISOString(),
      envVars,
      allProcessEnvKeys: Object.keys(process.env).length,
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

export async function POST(request: NextRequest) {
  try {
    // Test environment variables in the same context as login route
    console.log("=== LOGIN ENV TEST ===");
    console.log("Route: /api/test-login-env");
    console.log("Timestamp:", new Date().toISOString());
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log(
      "NEXT_PUBLIC_JWT_SECRET:",
      process.env.NEXT_PUBLIC_JWT_SECRET ? "Defined" : "Undefined"
    );
    console.log(
      "NEXT_PUBLIC_MONGODB_URI:",
      process.env.NEXT_PUBLIC_MONGODB_URI ? "Defined" : "Undefined"
    );
    console.log(
      "NEXT_PUBLIC_GEMINI_API_KEY:",
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ? "Defined" : "Undefined"
    );

    // Try different ways to access environment variables
    const envVars = {
      direct: {
        JWT_SECRET: process.env.NEXT_PUBLIC_JWT_SECRET,
        MONGODB_URI: process.env.NEXT_PUBLIC_MONGODB_URI,
      },
      viaObject: {
        JWT_SECRET: (process.env as any).NEXT_PUBLIC_JWT_SECRET,
        MONGODB_URI: (process.env as any).NEXT_PUBLIC_MONGODB_URI,
      },
      allKeys: Object.keys(process.env).filter(
        (key) =>
          key.includes("JWT") || key.includes("MONGO") || key.includes("GEMINI")
      ),
    };

    console.log(
      "Environment variable test results:",
      JSON.stringify(envVars, null, 2)
    );
    console.log("=== END LOGIN ENV TEST ===");

    return NextResponse.json({
      success: true,
      message: "Login environment test",
      route: "/api/test-login-env",
      timestamp: new Date().toISOString(),
      envVars,
      allProcessEnvKeys: Object.keys(process.env).length,
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
