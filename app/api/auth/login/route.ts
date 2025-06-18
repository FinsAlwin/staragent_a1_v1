import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "../../../../lib/db";
import User from "../../../../models/User";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    // Enhanced environment variable debugging
    console.log("=== ENVIRONMENT VARIABLE DEBUG ===");
    console.log("Route: /api/auth/login");
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
    console.log("=== END DEBUG ===");

    const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET;
    if (!JWT_SECRET) {
      return NextResponse.json(
        {
          error: "NEXT_PUBLIC_JWT_SECRET environment variable is not defined",
          debug: {
            route: "/api/auth/login",
            timestamp: new Date().toISOString(),
            envVars,
            allProcessEnvKeys: Object.keys(process.env).length,
          },
        },
        { status: 500 }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Connect to database
    try {
      await connectDB();
    } catch (dbError: any) {
      console.error("Database connection error:", dbError);
      return NextResponse.json(
        { error: "Database connection failed", details: dbError.message },
        { status: 500 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Store token in database
    const tokenExpiry = new Date();
    tokenExpiry.setDate(tokenExpiry.getDate() + 30); // 30 days from now

    user.token = token;
    user.tokenExpiry = tokenExpiry;
    await user.save();

    // Create the response
    const { password: _, ...userWithoutPassword } = user.toObject();
    const response = NextResponse.json({
      user: userWithoutPassword,
      token,
    });

    // Set the token as an HTTP-only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed", details: error.message },
      { status: 500 }
    );
  }
}
