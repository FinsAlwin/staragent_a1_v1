import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ExtractionField from "@/models/ExtractionField";
import { verifyAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
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
    const fields = await ExtractionField.find({});
    return NextResponse.json({ fields });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch extraction fields" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Validate required fields
    if (!data.name || !data.type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if field with same name already exists
    const existingField = await ExtractionField.findOne({ name: data.name });
    if (existingField) {
      return NextResponse.json(
        { error: "Field with this name already exists" },
        { status: 400 }
      );
    }

    // Create new extraction field
    const field = await ExtractionField.create(data);
    return NextResponse.json(field, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to create extraction field" },
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
