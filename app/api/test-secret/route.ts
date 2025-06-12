import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    secretExists: !!process.env.JWT_SECRET,
    secretLength: process.env.JWT_SECRET?.length,
    secretStart: process.env.JWT_SECRET?.substring(0, 10) + "...",
    nodeEnv: process.env.NODE_ENV,
  });
}
