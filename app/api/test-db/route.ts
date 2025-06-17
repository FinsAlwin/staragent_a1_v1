import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      return NextResponse.json(
        {
          success: false,
          error: "MONGODB_URI environment variable is not set",
        },
        { status: 500 }
      );
    }

    // Test basic MongoDB connection
    try {
      const mongoose = await import("mongoose");

      // Set connection options
      const options = {
        bufferCommands: false,
        maxPoolSize: 1,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      // Try to connect
      await mongoose.connect(mongoUri, options);

      // Test if we can access the database
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error("Database connection failed - no database object");
      }

      const collections = await db.listCollections().toArray();

      // Close the connection
      await mongoose.disconnect();

      return NextResponse.json({
        success: true,
        message: "Database connection successful",
        collections: collections.map((col) => col.name),
        mongoUriStart: mongoUri.substring(0, 20) + "...",
      });
    } catch (dbError: any) {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: {
            message: dbError.message,
            name: dbError.name,
            code: dbError.code,
          },
          mongoUriStart: mongoUri.substring(0, 20) + "...",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
