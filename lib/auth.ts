import { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import User from "@/models/User";
import dbConnect from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function verifyAuth(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return null;
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Verify that the token exists in the database
    await dbConnect();
    const user = await User.findOne({ token });
    if (!user || !user.tokenExpiry || new Date(user.tokenExpiry) < new Date()) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}

export async function verifyBearerToken(request: NextRequest) {
  try {
    // Get the Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return null;
    }

    // Extract the token
    const token = authHeader.split(" ")[1];
    if (!token) {
      return null;
    }

    // Verify the token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Verify that the token exists in the database
    await dbConnect();
    const user = await User.findOne({ token });
    if (!user || !user.tokenExpiry || new Date(user.tokenExpiry) < new Date()) {
      return null;
    }

    return {
      ...payload,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    return null;
  }
}
