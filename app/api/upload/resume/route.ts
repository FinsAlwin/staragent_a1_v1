import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const payload = await verifyAuth(request);
    if (!payload) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // For now, just return success
    // In a real application, you would process the file upload here
    return NextResponse.json({
      message: "Resume uploaded successfully",
      userId: payload.userId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to upload resume" },
      { status: 500 }
    );
  }
}
