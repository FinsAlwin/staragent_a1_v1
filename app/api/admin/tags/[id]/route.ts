import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../../lib/db";
import Tag from "../../../../../models/Tag";
import { verifyAuth } from "../../../../../lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const user = await verifyAuth(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    await dbConnect();
    const tag = await Tag.findById(params.id);

    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    return NextResponse.json(tag);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch tag" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const user = await verifyAuth(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, color } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    await dbConnect();

    // Check if tag exists
    const tag = await Tag.findById(params.id);
    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    // Check if name is taken by another tag
    const existingTag = await Tag.findOne({ name, _id: { $ne: params.id } });
    if (existingTag) {
      return NextResponse.json(
        { error: "Tag name already exists" },
        { status: 400 }
      );
    }

    // Update tag
    const updatedTag = await Tag.findByIdAndUpdate(
      params.id,
      { name, description, color },
      { new: true }
    );

    return NextResponse.json(updatedTag);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update tag" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const user = await verifyAuth(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Check if tag exists
    const tag = await Tag.findById(params.id);
    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    // Delete tag
    await Tag.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Tag deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete tag" },
      { status: 500 }
    );
  }
}
