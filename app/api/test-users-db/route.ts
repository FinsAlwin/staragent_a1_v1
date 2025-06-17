import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Test basic mongoose operations
    const mongoose = await import("mongoose");

    // Check if database is connected
    if (!mongoose.connection.db) {
      return NextResponse.json({
        success: false,
        message: "Database not connected",
      });
    }

    // Get all collections
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();

    // Check if users collection exists
    const usersCollection = collections.find((col) => col.name === "users");

    if (!usersCollection) {
      return NextResponse.json({
        success: false,
        message: "Users collection not found",
        collections: collections.map((col) => col.name),
      });
    }

    // Try to get user count directly from collection
    const usersCollectionObj = mongoose.connection.db.collection("users");
    const userCount = await usersCollectionObj.countDocuments();

    // Try to get one user document
    const userDoc = await usersCollectionObj.findOne({});

    return NextResponse.json({
      success: true,
      message: "Users database test successful",
      collections: collections.map((col) => col.name),
      usersCollectionExists: !!usersCollection,
      userCount: userCount,
      hasUsers: !!userDoc,
      userSample: userDoc
        ? {
            _id: userDoc._id,
            email: userDoc.email,
            username: userDoc.username,
            role: userDoc.role,
            hasPassword: !!userDoc.password,
          }
        : null,
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
