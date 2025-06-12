import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const users = await User.find({}).select("-password -token -tokenExpiry");

    return NextResponse.json({
      message: "Users retrieved successfully",
      count: users.length,
      users: users,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}
