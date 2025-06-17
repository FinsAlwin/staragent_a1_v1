import dbConnect from "@/lib/db";
import ExtractionField from "@/models/ExtractionField";
import { verifyAuth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    await dbConnect();
    const extractionFields = await ExtractionField.find().sort({ name: 1 });
    return NextResponse.json(extractionFields);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch extraction fields" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    await dbConnect();

    // Check if extraction field already exists
    const existingField = await ExtractionField.findOne({ name });
    if (existingField) {
      return NextResponse.json(
        { error: "Extraction field with this name already exists" },
        { status: 400 }
      );
    }

    const extractionField = new ExtractionField({
      name,
      description: description || "",
    });

    await extractionField.save();
    return NextResponse.json(extractionField, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create extraction field" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await verifyAuth(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { error: "Field ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Update the field
    const field = await ExtractionField.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!field) {
      return NextResponse.json({ error: "Field not found" }, { status: 404 });
    }

    return NextResponse.json(field);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update extraction field" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await verifyAuth(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Field ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Delete the field
    const field = await ExtractionField.findByIdAndDelete(id);

    if (!field) {
      return NextResponse.json({ error: "Field not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Field deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete extraction field" },
      { status: 500 }
    );
  }
}
