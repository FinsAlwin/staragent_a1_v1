import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../../lib/db";
import StoredImage from "../../../../../models/StoredImage";
import { getImageDescription } from "../../../../../services/faceMatchingService";
import { uploadImageToS3 } from "../../../../../lib/s3Storage";

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
      s3Key: img.s3Key,
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

    // Convert file to buffer for S3 upload
    const arrayBuffer = await imageFile.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Upload to S3
    const { url: imageUrl, key } = await uploadImageToS3(
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

    // Store image metadata in database
    const image = new StoredImage({
      name,
      description,
      imageUrl,
      s3Key: key,
      uploadedBy,
      uploadedAt: new Date(),
      isActive: true,
    });

    await image.save();

    return NextResponse.json({
      success: true,
      image: {
        id: image._id,
        name: image.name,
        description: image.description,
        imageUrl: image.imageUrl,
        uploadedAt: image.uploadedAt,
      },
    });
  } catch (error: any) {
    console.error("Error storing image:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json(
      {
        error: "Failed to store image",
        details: error.message,
        type: error.name,
      },
      { status: 500 }
    );
  }
}
