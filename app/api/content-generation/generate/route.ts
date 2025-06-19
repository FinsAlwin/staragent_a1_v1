import { NextRequest, NextResponse } from "next/server";
import { generateContentWithGemini } from "../../../../services/geminiService";

export async function POST(request: NextRequest) {
  try {
    const { category, prompt } = await request.json();
    if (!category || !prompt) {
      return NextResponse.json(
        { error: "Missing category or prompt" },
        { status: 400 }
      );
    }
    const content = await generateContentWithGemini(category, prompt);
    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Unknown error" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
