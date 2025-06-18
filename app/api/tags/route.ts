import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/db";
import Tag from "../../../models/Tag";
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
    const tags = await Tag.find().sort({ name: 1 });

    return NextResponse.json({ tags });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch tags" },
      { status: 500 }
    );
  }
}
