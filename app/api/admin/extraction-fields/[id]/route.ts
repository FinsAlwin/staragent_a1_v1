import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../../lib/db";
import ExtractionField from "../../../../../models/ExtractionField";
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
    const field = await ExtractionField.findById(params.id);

    if (!field) {
      return NextResponse.json({ error: "Field not found" }, { status: 404 });
    }

    return NextResponse.json(field);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch field" },
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
    const { name, description, type, required } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if field exists
    const existingField = await ExtractionField.findById(params.id);
    if (!existingField) {
      return NextResponse.json({ error: "Field not found" }, { status: 404 });
    }

    // Check if name is taken by another field
    const duplicateField = await ExtractionField.findOne({
      name,
      _id: { $ne: params.id },
    });
    if (duplicateField) {
      return NextResponse.json(
        { error: "Field name already exists" },
        { status: 400 }
      );
    }

    // Update field
    const updatedField = await ExtractionField.findByIdAndUpdate(
      params.id,
      { name, description, type, required },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedField);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update field" },
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

    // Check if field exists
    const field = await ExtractionField.findById(params.id);
    if (!field) {
      return NextResponse.json({ error: "Field not found" }, { status: 404 });
    }

    // Delete field
    await ExtractionField.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Field deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete field" },
      { status: 500 }
    );
  }
}
