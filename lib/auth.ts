import { NextRequest } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import User from "@/models/User";
import dbConnect from "@/lib/db";

// Get JWT secret from environment variables
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("NEXT_PUBLIC_JWT_SECRET environment variable is not defined");
}

export async function verifyAuth(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return null;
    }

    const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);
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
    const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);
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

// Function to verify JWT token
export async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

// Function to generate JWT token
export async function generateToken(payload: any) {
  try {
    const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(secret);
    return token;
  } catch (error) {
    throw new Error("Failed to generate token");
  }
}
