import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../../../lib/db";
import StoredImage from "../../../../../../models/StoredImage";
import { deleteImageFromS3 } from "../../../../../../lib/s3Storage";

// GET - Retrieve a specific stored image
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

    return NextResponse.json({ image });
  } catch (error: any) {
    console.error("Error fetching stored image:", error);
    return NextResponse.json(
      { error: "Failed to fetch stored image" },
      { status: 500 }
    );
  }
}

// PUT - Update a stored image
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, description, isActive } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedImage = await StoredImage.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-__v");

    if (!updatedImage) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Image updated successfully",
      image: updatedImage,
    });
  } catch (error: any) {
    console.error("Error updating stored image:", error);
    return NextResponse.json(
      { error: "Failed to update stored image" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a stored image
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const image = await StoredImage.findById(params.id);

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Delete from S3 if s3Key exists
    if (image.s3Key) {
      try {
        await deleteImageFromS3(image.s3Key);
      } catch (s3Error) {
        console.error("Error deleting S3 file:", s3Error);
        // Continue with database deletion even if S3 deletion fails
      }
    }

    // Delete from database
    await StoredImage.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
