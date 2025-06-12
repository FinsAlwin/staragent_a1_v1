import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/db";
import User from "../../../../models/User";
import { requireAdmin } from "../../../../middleware/auth";

export async function POST(request: NextRequest) {
  try {
    // Check if request is from admin
    const authResponse = await requireAdmin(request);
    if (authResponse instanceof NextResponse && authResponse.status !== 200) {
      return authResponse;
    }

    // Connect to database
    await dbConnect();

    // Get request body
    const body = await request.json();
    const { username, email, password, role } = body;

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or username already exists" },
        { status: 400 }
      );
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role: role || "user", // Default to 'user' if role not specified
    });

    await user.save();

    // Return success without password
    const { password: _, ...userWithoutPassword } = user.toObject();
    return NextResponse.json(userWithoutPassword);
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Error creating user" },
      { status: 500 }
    );
  }
}
