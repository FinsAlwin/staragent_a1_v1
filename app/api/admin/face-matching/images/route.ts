import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../../lib/db";
import StoredImage from "../../../../../models/StoredImage";
import { getImageDescription } from "../../../../../services/faceMatchingService";
import { uploadImageToLocal } from "../../../../../lib/amplifyStorage";

// GET - Retrieve all stored images
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const images = await StoredImage.find({ isActive: true })
      .sort({ uploadedAt: -1 })
      .select("-__v");

    // Map _id to id for consistency
    const mappedImages = images.map((img) => ({
      id: img._id,
      _id: img._id,
      name: img.name,
      description: img.description,
      imageUrl: img.imageUrl,
      uploadedAt: img.uploadedAt,
      uploadedBy: img.uploadedBy,
      isActive: img.isActive,
    }));

    return NextResponse.json({ images: mappedImages });
  } catch (error: any) {
    console.error("Error fetching stored images:", error);
    return NextResponse.json(
      { error: "Failed to fetch stored images" },
      { status: 500 }
    );
  }
}

// POST - Add a new stored image
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Parse form data
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const imageFile = formData.get("image") as File;
    const uploadedBy = formData.get("uploadedBy") as string;

    if (!name || !imageFile || !uploadedBy) {
      return NextResponse.json(
        { error: "Missing required fields: name, image, uploadedBy" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Invalid file type. Must be an image." },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image file too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Convert file to buffer for local storage
    const arrayBuffer = await imageFile.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Upload to local storage
    const { url: imageUrl, key } = await uploadImageToLocal(
      imageBuffer,
      imageFile.name,
      imageFile.type
    );

    // Convert to base64 for AI processing
    const base64Image = imageBuffer.toString("base64");

    // Get AI description of the image
    const description = await getImageDescription(base64Image, imageFile.type);

    // Check if a face was detected
    if (description.toLowerCase().includes("no clear human face detected")) {
      return NextResponse.json(
        { error: "No clear human face detected in the uploaded image" },
        { status: 400 }
      );
    }

    // Create new stored image with local file URL
    const newImage = new StoredImage({
      name,
      description,
      imageUrl, // Store local file URL
      uploadedBy,
      isActive: true,
    });

    await newImage.save();

    console.log(`Image stored successfully for: ${name} at ${imageUrl}`);

    return NextResponse.json(
      {
        message: "Image stored successfully",
        image: {
          id: newImage._id,
          name: newImage.name,
          description: newImage.description,
          imageUrl: newImage.imageUrl,
          uploadedAt: newImage.uploadedAt,
          uploadedBy: newImage.uploadedBy,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error storing image:", error);
    return NextResponse.json(
      { error: "Failed to store image" },
      { status: 500 }
    );
  }
}
