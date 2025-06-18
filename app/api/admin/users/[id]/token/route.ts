import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const adminUser = await verifyAuth(request);
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Find the user
    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate new token with 30 days expiry
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        exp: Math.floor(expiryDate.getTime() / 1000),
      },
      process.env.NEXT_PUBLIC_JWT_SECRET!
    );

    // Update user with new token
    user.token = token;
    user.tokenExpiry = expiryDate;
    await user.save();

    return NextResponse.json({
      token,
      expiry: expiryDate.toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
