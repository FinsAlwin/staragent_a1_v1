import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Tag from "@/models/Tag";
import ExtractionField from "@/models/ExtractionField";
import { verifyAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await verifyAuth(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get counts
    const [totalUsers, totalTags, totalExtractionFields] = await Promise.all([
      User.countDocuments(),
      Tag.countDocuments(),
      ExtractionField.countDocuments(),
    ]);

    return NextResponse.json({
      totalUsers,
      totalTags,
      totalExtractionFields,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
