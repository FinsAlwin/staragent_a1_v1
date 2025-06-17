import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const results = {
      step1: { name: "Basic import", status: "testing", error: null },
      step2: { name: "Mongoose import", status: "testing", error: null },
      step3: { name: "ConnectDB import", status: "testing", error: null },
      step4: { name: "User model import", status: "testing", error: null },
    };

    // Step 1: Basic functionality
    try {
      results.step1.status = "passed";
    } catch (error: any) {
      results.step1.status = "failed";
      results.step1.error = error.message;
    }

    // Step 2: Mongoose import
    try {
      const mongoose = await import("mongoose");
      results.step2.status = "passed";
    } catch (error: any) {
      results.step2.status = "failed";
      results.step2.error = error.message;
    }

    // Step 3: ConnectDB import
    try {
      const connectDB = (await import("../../../lib/db")).default;
      results.step3.status = "passed";
    } catch (error: any) {
      results.step3.status = "failed";
      results.step3.error = error.message;
    }

    // Step 4: User model import
    try {
      const User = (await import("../../../models/User")).default;
      results.step4.status = "passed";
    } catch (error: any) {
      results.step4.status = "failed";
      results.step4.error = error.message;
    }

    return NextResponse.json({
      success: true,
      message: "Import test completed",
      results,
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
