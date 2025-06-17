import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../../../../lib/db";
import StoredImage from "../../../../../../../models/StoredImage";
import { getImageFromLocal } from "../../../../../../../lib/amplifyStorage";

// GET - Serve the image from local storage
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const image = await StoredImage.findById(params.id).select("-__v");

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    if (!image.imageUrl) {
      return NextResponse.json(
        { error: "Image URL not found" },
        { status: 404 }
      );
    }

    // Handle local file URLs (e.g., /uploads/faces/filename.jpg)
    if (image.imageUrl.startsWith("/uploads/")) {
      try {
        // Extract filename from URL
        const fileName = image.imageUrl.split("/").pop();
        if (!fileName) {
          return NextResponse.json(
            { error: "Invalid image URL" },
            { status: 404 }
          );
        }

        // Read image from local storage
        const imageBuffer = await getImageFromLocal(fileName);

        // Determine content type from file extension
        const ext = fileName.split(".").pop()?.toLowerCase();
        let contentType = "image/jpeg";

        if (ext === "png") contentType = "image/png";
        else if (ext === "gif") contentType = "image/gif";
        else if (ext === "webp") contentType = "image/webp";
        else if (ext === "svg") contentType = "image/svg+xml";

        return new NextResponse(imageBuffer, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000", // Cache for 1 year
          },
        });
      } catch (fileError) {
        console.error(`Error reading image file: ${image.imageUrl}`, fileError);
        return NextResponse.json(
          { error: "Image file not found" },
          { status: 404 }
        );
      }
    }

    // Handle base64 data URLs (fallback)
    if (image.imageUrl.startsWith("data:")) {
      const matches = image.imageUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        return NextResponse.json(
          { error: "Invalid image format" },
          { status: 400 }
        );
      }

      const contentType = matches[1];
      const base64Data = matches[2];
      const imageBuffer = Buffer.from(base64Data, "base64");

      return new NextResponse(imageBuffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000",
        },
      });
    }

    return NextResponse.json(
      { error: "Unsupported image format" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error serving image:", error);
    return NextResponse.json(
      { error: "Failed to serve image" },
      { status: 500 }
    );
  }
}
