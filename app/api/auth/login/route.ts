import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "../../../../lib/db";
import User from "../../../../models/User";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    // Check JWT_SECRET inside the function
    console.log(
      "JWT_SECRET:",
      process.env.JWT_SECRET ? "Defined" : "Undefined"
    );

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return NextResponse.json(
        { error: "JWT_SECRET environment variable is not defined" },
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
