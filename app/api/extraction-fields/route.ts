import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/db";
import ExtractionField from "../../../models/ExtractionField";
import { verifyAuth } from "../../../lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Verify user authentication (any authenticated user can access)
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();
    const extractionFields = await ExtractionField.find().sort({ key: 1 });

    return NextResponse.json({ extractionFields });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch extraction fields" },
      { status: 500 }
    );
  }
}
