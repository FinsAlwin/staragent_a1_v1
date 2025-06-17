import mongoose from "mongoose";

interface GlobalWithMongoose extends Global {
  mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

declare const global: GlobalWithMongoose;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // Check environment variable inside the function
  let MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }

  // Remove any extra quotes from the URI
  MONGODB_URI = MONGODB_URI.replace(/^["']|["']$/g, "");

  // Validate the URI format
  if (
    !MONGODB_URI.startsWith("mongodb://") &&
    !MONGODB_URI.startsWith("mongodb+srv://")
  ) {
    throw new Error(
      "Invalid MongoDB URI format. Must start with 'mongodb://' or 'mongodb+srv://'"
    );
  }

  // If we have a cached connection, check if it's still valid
  if (cached.conn) {
    // Check if the connection is still alive
    if (mongoose.connection.readyState === 1) {
      return cached.conn;
    } else {
      // Connection is dead, clear the cache
      cached.conn = null;
      cached.promise = null;
    }
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
