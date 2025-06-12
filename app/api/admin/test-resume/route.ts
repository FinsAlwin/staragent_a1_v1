import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import ExtractionField from "@/models/ExtractionField";
import Tag from "@/models/Tag";
import { parsePdfToText, parseDocxToText } from "@/services/fileParserService";
import { analyzeResumeWithGemini } from "@/services/geminiService";

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

    const formData = await request.formData();
    const resumeBlob = formData.get("resume");
    // Check if resumeBlob is a Blob (file upload)
    if (!resumeBlob || typeof (resumeBlob as Blob).arrayBuffer !== "function") {
      return NextResponse.json(
        { error: "No resume file provided or file is invalid" },
        { status: 400 }
      );
    }
    const fileBlob = resumeBlob as Blob;
    const resumeArrayBuffer = await fileBlob.arrayBuffer();
    // Try to get the file name (if available)
    const fileName = (fileBlob as any).name || "";
    const fileExtension = fileName.toLowerCase().split(".").pop();

    // Connect to database and fetch extraction fields and tags
    await dbConnect();
    const extractionFields = await ExtractionField.find({});
    const tags = await Tag.find({});

    // Convert database models to the format expected by the Gemini service
    type GeminiExtractionField = {
      id: string;
      key: string;
      label: string;
      description?: string;
    };
    const fieldsForAnalysis: GeminiExtractionField[] = extractionFields.flatMap(
      (field) => {
        const name = field.name || field.label || field.key;
        if (!name) return [];
        return [
          {
            id: field._id?.toString?.() || field.id || "",
            key: field.key || name.toLowerCase().replace(/\s+/g, ""),
            label: name,
            description: field.description || undefined,
          },
        ];
      }
    );

    const tagsForAnalysis = tags.map((tag) => ({
      id: tag._id.toString(),
      name: tag.name,
    }));

    // Parse the resume file based on its type
    let resumeText: string;
    if (fileExtension === "pdf") {
      resumeText = await parsePdfToText(resumeArrayBuffer);
    } else if (fileExtension === "docx" || fileExtension === "doc") {
      resumeText = await parseDocxToText(resumeArrayBuffer);
    } else {
      return NextResponse.json(
        { error: "Unsupported file format. Please upload a PDF or DOCX file." },
        { status: 400 }
      );
    }

    // Analyze the resume using Gemini
    const analysisResult = await analyzeResumeWithGemini(
      resumeText,
      fieldsForAnalysis,
      tagsForAnalysis
    );

    return NextResponse.json(analysisResult);
  } catch (error: any) {
    console.error("Error processing resume:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process resume" },
      { status: 500 }
    );
  }
}
