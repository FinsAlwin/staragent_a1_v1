import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Step 1: Check environment variables
    const mongoUri = process.env.MONGODB_URI;
    const hasMongoUri = !!mongoUri;

    // Step 2: Try to import mongoose
    let mongoose;
    try {
      mongoose = await import("mongoose");
    } catch (importError: any) {
      return NextResponse.json({
        success: false,
        step: "Mongoose import",
        error: importError.message,
        errorType: importError.constructor.name,
        hasMongoUri: hasMongoUri,
      });
    }

    // Step 3: Try to connect directly
    let connection;
    try {
      // Clean the URI
      const cleanUri = mongoUri?.replace(/^["']|["']$/g, "");

      // Set connection options
      const options = {
        bufferCommands: false,
        maxPoolSize: 1,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      // Try to connect
      connection = await mongoose.connect(cleanUri!, options);
    } catch (connectError: any) {
      return NextResponse.json({
        success: false,
        step: "Database connection",
        error: connectError.message,
        errorType: connectError.constructor.name,
        hasMongoUri: hasMongoUri,
        mongoUriStart: mongoUri?.substring(0, 20) + "...",
      });
    }

    // Step 4: Try to access database
    let db;
    try {
      db = connection.connection.db;
      if (!db) {
        throw new Error("No database object available");
      }
    } catch (dbError: any) {
      return NextResponse.json({
        success: false,
        step: "Database access",
        error: dbError.message,
        errorType: dbError.constructor.name,
        hasMongoUri: hasMongoUri,
        connectionState: connection.connection.readyState,
      });
    }

    // Step 5: Try to list collections
    let collections;
    try {
      collections = await db.listCollections().toArray();
    } catch (collectionsError: any) {
      return NextResponse.json({
        success: false,
        step: "List collections",
        error: collectionsError.message,
        errorType: collectionsError.constructor.name,
        hasMongoUri: hasMongoUri,
        connectionState: connection.connection.readyState,
      });
    }

    // Step 6: Try to access users collection
    let usersCollection;
    try {
      usersCollection = db.collection("users");
    } catch (collectionError: any) {
      return NextResponse.json({
        success: false,
        step: "Users collection access",
        error: collectionError.message,
        errorType: collectionError.constructor.name,
        hasMongoUri: hasMongoUri,
        collections: collections.map((col: any) => col.name),
      });
    }

    // Step 7: Try to count users
    let userCount;
    try {
      userCount = await usersCollection.countDocuments();
    } catch (countError: any) {
      return NextResponse.json({
        success: false,
        step: "User count",
        error: countError.message,
        errorType: countError.constructor.name,
        hasMongoUri: hasMongoUri,
        collections: collections.map((col: any) => col.name),
        usersCollectionExists: !!usersCollection,
      });
    }

    // Close connection
    try {
      await mongoose.disconnect();
    } catch (disconnectError: any) {
      // Don't fail the test for disconnect errors
    }

    return NextResponse.json({
      success: true,
      message: "Basic database test successful",
      hasMongoUri: hasMongoUri,
      connectionState: connection.connection.readyState,
      collections: collections.map((col: any) => col.name),
      usersCollectionExists: !!usersCollection,
      userCount: userCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        step: "General error",
        error: error.message,
        errorType: error.constructor.name,
      },
      { status: 500 }
    );
  }
}
