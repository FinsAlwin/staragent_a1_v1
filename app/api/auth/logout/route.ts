import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    // Get the token from the request
    const token = request.cookies.get("token")?.value;

    if (token) {
      // Clear token from database
      await dbConnect();
      await User.updateOne(
        { token: token },
        { $unset: { token: 1, tokenExpiry: 1 } }
      );
    }

    // Create response
    const response = NextResponse.json({ message: "Logged out successfully" });

    // Clear the token cookie
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0, // This immediately expires the cookie
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
