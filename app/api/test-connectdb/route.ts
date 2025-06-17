import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Step 1: Try to import connectDB
    let connectDB;
    try {
      connectDB = (await import("../../../lib/db")).default;
    } catch (importError: any) {
      return NextResponse.json({
        success: false,
        step: "connectDB import",
        error: importError.message,
        errorType: importError.constructor.name,
      });
    }

    // Step 2: Try to call connectDB
    let connection;
    try {
      connection = await connectDB();
    } catch (connectError: any) {
      return NextResponse.json({
        success: false,
        step: "connectDB execution",
        error: connectError.message,
        errorType: connectError.constructor.name,
      });
    }

    // Step 3: Check if connection is valid
    if (!connection) {
      return NextResponse.json({
        success: false,
        step: "connection validation",
        error: "connectDB returned null or undefined",
      });
    }

    // Step 4: Check connection state
    const mongoose = await import("mongoose");
    const readyState = mongoose.connection.readyState;
    let readyStateText = "unknown";
    if (readyState === 0) readyStateText = "disconnected";
    else if (readyState === 1) readyStateText = "connected";
    else if (readyState === 2) readyStateText = "connecting";
    else if (readyState === 3) readyStateText = "disconnecting";

    return NextResponse.json({
      success: true,
      message: "connectDB test successful",
      connectionExists: !!connection,
      readyState: readyState,
      readyStateText: readyStateText,
      isConnected: readyState === 1,
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
