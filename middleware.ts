import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// List of public routes that don't require authentication
const publicRoutes = [
  "/login",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/analyze",
  "/api/analyze-status", // Public job status API
  "/api/face-matching/match", // Public face matching API
  "/face-matching", // Public face matching demo page
  "/api/content-generation/generate", // Make content generation public
];

// Function to verify JWT token
async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Get token from cookie or Authorization header
  let token = request.cookies.get("token")?.value;

  // If no cookie token, check for bearer token in Authorization header
  if (!token) {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  // Verify token and get payload
  const payload = token ? await verifyToken(token) : null;

  // Handle login page access
  if (pathname === "/login") {
    // If user is already authenticated, redirect to appropriate dashboard
    if (payload) {
      const redirectUrl =
        payload.role === "admin" ? "/admin/dashboard" : "/dashboard";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    // Allow access to login page if not authenticated
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!token || !payload) {
    // For API routes, return 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    // For pages, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check admin routes
  if (pathname.startsWith("/api/admin/") && payload.role !== "admin") {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  // Check admin page routes
  if (pathname.startsWith("/admin/") && payload.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Handle root path
  if (pathname === "/") {
    const redirectUrl =
      payload.role === "admin" ? "/admin/dashboard" : "/dashboard";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Add the token to the Authorization header for API routes
  if (pathname.startsWith("/api/")) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("Authorization", `Bearer ${token}`);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /_next/* (Next.js internals)
     * 2. /static/* (static files)
     * 3. /favicon.ico, /robots.txt (static files)
     */
    "/((?!_next/|static/|favicon.ico|robots.txt).*)",
  ],
};
