import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";

export async function GET(request: NextRequest) {
  try {
    // Step 1: Connect using connectDB
    await connectDB();

    // Step 2: Import mongoose to check connection state
    const mongoose = await import("mongoose");

    // Step 3: Check connection state
    const readyState = mongoose.connection.readyState;
    let readyStateText = "unknown";
    if (readyState === 0) readyStateText = "disconnected";
    else if (readyState === 1) readyStateText = "connected";
    else if (readyState === 2) readyStateText = "connecting";
    else if (readyState === 3) readyStateText = "disconnecting";

    if (readyState !== 1) {
      return NextResponse.json({
        success: false,
        message: "Database not connected",
        readyState: readyState,
        readyStateText: readyStateText,
      });
    }

    // Step 4: Test User model import
    let User;
    try {
      User = (await import("../../../models/User")).default;
    } catch (importError: any) {
      return NextResponse.json({
        success: false,
        step: "User model import",
        error: importError.message,
        errorType: importError.constructor.name,
        readyState: readyState,
        readyStateText: readyStateText,
      });
    }

    // Step 5: Test user count
    let userCount;
    try {
      userCount = await User.countDocuments();
    } catch (countError: any) {
      return NextResponse.json({
        success: false,
        step: "User count",
        error: countError.message,
        errorType: countError.constructor.name,
        readyState: readyState,
        readyStateText: readyStateText,
      });
    }

    // Step 6: Test user lookup
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
        readyState: readyState,
        readyStateText: readyStateText,
      });
    }

    return NextResponse.json({
      success: true,
      message: "connectDB users test successful",
      readyState: readyState,
      readyStateText: readyStateText,
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
