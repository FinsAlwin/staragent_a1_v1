import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "JWT Secret test",
    timestamp: new Date().toISOString(),
    secretExists: !!process.env.NEXT_PUBLIC_JWT_SECRET,
    secretLength: process.env.NEXT_PUBLIC_JWT_SECRET?.length,
    secretStart: process.env.NEXT_PUBLIC_JWT_SECRET?.substring(0, 10) + "...",
  });
}
