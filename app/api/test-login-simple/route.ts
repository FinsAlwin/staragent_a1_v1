import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";

export async function POST(request: NextRequest) {
  try {
    // Step 1: Test database connection
    await connectDB();

    // Step 2: Test User model import
    let User;
    try {
      User = (await import("../../../models/User")).default;
    } catch (importError: any) {
      return NextResponse.json({
        success: false,
        step: "User model import",
        error: importError.message,
        errorType: importError.constructor.name,
      });
    }

    // Step 3: Test user count
    let userCount;
    try {
      userCount = await User.countDocuments();
    } catch (countError: any) {
      return NextResponse.json({
        success: false,
        step: "User count",
        error: countError.message,
        errorType: countError.constructor.name,
      });
    }

    // Step 4: Test user lookup
    let testUser;
    try {
      testUser = await User.findOne({});
    } catch (findError: any) {
      return NextResponse.json({
        success: false,
        step: "User lookup",
        error: findError.message,
        errorType: findError.constructor.name,
        userCount: userCount,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Login test successful",
      userCount: userCount,
      userFound: !!testUser,
      userEmail: testUser?.email,
      userRole: testUser?.role,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        step: "General error",
        error: error.message,
        errorType: error.constructor.name,
      },
      { status: 500 }
    );
  }
}
