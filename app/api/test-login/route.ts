import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "../../../lib/db";
import User from "../../../models/User";

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Check if we have any users
    const userCount = await User.countDocuments();

    if (userCount === 0) {
      return NextResponse.json({
        success: false,
        message: "No users found in database",
        userCount: 0,
      });
    }

    // Get the first user for testing
    const testUser = await User.findOne({});

    if (!testUser) {
      return NextResponse.json({
        success: false,
        message: "No test user found",
      });
    }

    // Test password verification
    const testPassword = "test123"; // This should match what you used to create the user
    const isPasswordValid = await bcrypt.compare(
      testPassword,
      testUser.password
    );

    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        message: "Password verification failed",
        userFound: true,
        userEmail: testUser.email,
        passwordValid: false,
      });
    }

    // Test JWT token generation
    const token = jwt.sign(
      {
        userId: testUser._id,
        email: testUser.email,
        role: testUser.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    return NextResponse.json({
      success: true,
      message: "Login test successful",
      userCount: userCount,
      userEmail: testUser.email,
      userRole: testUser.role,
      passwordValid: true,
      tokenGenerated: !!token,
      tokenLength: token.length,
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
