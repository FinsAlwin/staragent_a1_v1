import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET environment variable is not defined. Please check your environment configuration."
  );
}

interface JWTPayload {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}

export async function authenticateToken(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { error: "Authentication token is required" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET!) as unknown as JWTPayload;

    if (!decoded.userId || !decoded.role) {
      throw new Error("Invalid token payload");
    }

    // Add user info to request
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("userId", decoded.userId);
    requestHeaders.set("userRole", decoded.role);

    // Return modified request
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}

export async function requireAdmin(request: NextRequest) {
  try {
    const response = await authenticateToken(request);

    if (response instanceof NextResponse && response.status === 401) {
      return response;
    }

    const userRole = request.headers.get("userRole");

    if (userRole !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
