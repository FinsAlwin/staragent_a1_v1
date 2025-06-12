import { NextRequest, NextResponse } from "next/server";
import { verifyBearerToken } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { jwtVerify } from "jose";

export async function GET(request: NextRequest) {
  try {
    // Get the token from the header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    // Get token from cookie as well
    const cookieToken = request.cookies.get("token")?.value;

    if (!token && !cookieToken) {
      return NextResponse.json(
        {
          error: "No token provided",
          debug: {
            hasAuthHeader: !!authHeader,
            hasCookieToken: !!cookieToken,
            authHeaderValue: authHeader,
          },
        },
        { status: 401 }
      );
    }

    const tokenToUse = token || cookieToken;

    // Check if token exists in database
    await dbConnect();
    const user = await User.findOne({ token: tokenToUse });

    if (!user) {
      return NextResponse.json(
        { error: "Token not found in database" },
        { status: 401 }
      );
    }

    if (!user.tokenExpiry || new Date(user.tokenExpiry) < new Date()) {
      return NextResponse.json(
        { error: "Token has expired", expiry: user.tokenExpiry },
        { status: 401 }
      );
    }

    // Try to verify the JWT
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(tokenToUse!, secret);

      return NextResponse.json({
        message: "Authentication successful",
        debug: {
          tokenSource: token ? "header" : "cookie",
          tokenLength: tokenToUse?.length,
          hasUserInDB: !!user,
          jwtPayload: payload,
          cookieToken: !!cookieToken,
          headerToken: !!token,
        },
        user: user
          ? {
              _id: user._id,
              email: user.email,
              role: user.role,
            }
          : null,
        tokenInfo: {
          provided: tokenToUse,
          stored: user?.token,
          expiry: user?.tokenExpiry,
          jwtPayload: payload,
        },
      });
    } catch (jwtError: any) {
      return NextResponse.json(
        {
          error: "JWT verification failed",
          debug: {
            jwtError: jwtError.message,
            secretLength: process.env.JWT_SECRET?.length,
            tokenLength: tokenToUse?.length,
            hasUserInDB: !!user,
          },
        },
        { status: 401 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Authentication failed",
        debug: {
          stack:
            process.env.NODE_ENV === "development" ? error.stack : undefined,
        },
      },
      { status: 500 }
    );
  }
}
