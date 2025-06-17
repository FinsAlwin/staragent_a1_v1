import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const results = {
      step1: {
        name: "Request parsing",
        status: "testing",
        error: null as string | null,
        details: null as any,
      },
      step2: {
        name: "Database connection",
        status: "testing",
        error: null as string | null,
        details: null as any,
      },
      step3: {
        name: "User model import",
        status: "testing",
        error: null as string | null,
        details: null as any,
      },
      step4: {
        name: "User lookup",
        status: "testing",
        error: null as string | null,
        details: null as any,
      },
      step5: {
        name: "Password verification",
        status: "testing",
        error: null as string | null,
        details: null as any,
      },
      step6: {
        name: "JWT generation",
        status: "testing",
        error: null as string | null,
        details: null as any,
      },
    };

    // Step 1: Parse request body
    try {
      const body = await request.json();
      results.step1.status = "passed";
      results.step1.details = {
        hasEmail: !!body.email,
        hasPassword: !!body.password,
      };
    } catch (error: any) {
      results.step1.status = "failed";
      results.step1.error = error.message;
      return NextResponse.json({ success: false, results }, { status: 400 });
    }

    // Step 2: Connect to database
    try {
      const connectDB = (await import("../../../lib/db")).default;
      console.log("About to call connectDB...");
      await connectDB();
      console.log("connectDB completed successfully");
      results.step2.status = "passed";
      results.step2.details = { message: "Database connected successfully" };
    } catch (error: any) {
      console.error("Database connection error:", error);
      results.step2.status = "failed";
      results.step2.error = error.message;
      results.step2.details = {
        errorType: error.constructor.name,
        stack: error.stack?.split("\n").slice(0, 3).join("\n"),
      };
      return NextResponse.json({ success: false, results }, { status: 500 });
    }

    // Step 3: Import User model
    try {
      const User = (await import("../../../models/User")).default;
      results.step3.status = "passed";
    } catch (error: any) {
      results.step3.status = "failed";
      results.step3.error = error.message;
      return NextResponse.json({ success: false, results }, { status: 500 });
    }

    // Step 4: Look up user
    try {
      const User = (await import("../../../models/User")).default;
      const body = await request.json();
      const user = await User.findOne({ email: body.email });
      results.step4.status = "passed";
      results.step4.details = { userFound: !!user, userEmail: user?.email };
    } catch (error: any) {
      results.step4.status = "failed";
      results.step4.error = error.message;
      return NextResponse.json({ success: false, results }, { status: 500 });
    }

    // Step 5: Verify password
    try {
      const bcrypt = await import("bcryptjs");
      const User = (await import("../../../models/User")).default;
      const body = await request.json();
      const user = await User.findOne({ email: body.email });

      if (!user) {
        results.step5.status = "failed";
        results.step5.error = "User not found";
        return NextResponse.json({ success: false, results }, { status: 401 });
      }

      const isValid = await bcrypt.compare(body.password, user.password);
      results.step5.status = "passed";
      results.step5.details = { passwordValid: isValid };
    } catch (error: any) {
      results.step5.status = "failed";
      results.step5.error = error.message;
      return NextResponse.json({ success: false, results }, { status: 500 });
    }

    // Step 6: Generate JWT
    try {
      const jwt = await import("jsonwebtoken");
      const User = (await import("../../../models/User")).default;
      const body = await request.json();
      const user = await User.findOne({ email: body.email });

      if (!user) {
        results.step6.status = "failed";
        results.step6.error = "User not found";
        return NextResponse.json({ success: false, results }, { status: 401 });
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
      );

      results.step6.status = "passed";
      results.step6.details = {
        tokenGenerated: !!token,
        tokenLength: token.length,
      };
    } catch (error: any) {
      results.step6.status = "failed";
      results.step6.error = error.message;
      return NextResponse.json({ success: false, results }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Login step test completed",
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        errorType: error.constructor.name,
      },
      { status: 500 }
    );
  }
}
