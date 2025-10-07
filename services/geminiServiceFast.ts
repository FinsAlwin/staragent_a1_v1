import { GoogleGenAI } from "@google/genai";
import {
  type ExtractionField,
  type Tag,
  type ResumeAnalysisResult,
} from "../types";

// API key must be obtained from process.env.NEXT_PUBLIC_GEMINI_API_KEY
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;

if (!API_KEY) {
  console.error(
    "NEXT_PUBLIC_GEMINI_API_KEY is not set. Please ensure it is configured in your environment variables."
  );
} else {
  ai = new GoogleGenAI({ apiKey: API_KEY });
}

const GEMINI_MODEL = "gemini-2.5-flash";

// Faster JSON cleaning for sync processing
const fastCleanJsonString = (jsonStr: string): string => {
  let cleaned = jsonStr.trim();

  // Quick removal of common prefixes/suffixes
  const startIndex = cleaned.indexOf("{");
  const endIndex = cleaned.lastIndexOf("}");

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    cleaned = cleaned.substring(startIndex, endIndex + 1);
  }

  return cleaned;
};

export const analyzeResumeWithGeminiFast = async (
  resumeText: string,
  fieldsToExtract: ExtractionField[],
  availableTags: Tag[]
): Promise<ResumeAnalysisResult> => {
  if (!ai) {
    throw new Error(
      "Gemini API Key is not configured or client failed to initialize. Cannot analyze resume."
    );
  }

  // Simplified prompt for faster processing
  const fieldKeys = fieldsToExtract.map((f) => f.key).join(", ");
  const tagNames = availableTags.map((t) => t.name).join(", ");

  // Shorter, more direct prompt
  const prompt = `Analyze this resume and respond with ONLY valid JSON:

Resume:
${resumeText.substring(0, 3000)} ${
    resumeText.length > 3000 ? "...[truncated]" : ""
  }

Required JSON format:
{
  "summary": "200-300 word professional summary",
  "extractedInformation": {
    ${fieldsToExtract
      .map((f) => `"${f.key}": "extracted value or N/A"`)
      .join(",\n    ")}
  },
  "assignedTags": ["tag1", "tag2", "tag3"]
}

Available tags: ${tagNames}
Required fields: ${fieldKeys}

Respond with ONLY the JSON object, no other text.`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1, // Lower temperature for faster, more deterministic responses
        maxOutputTokens: 2048, // Limit output for faster processing
      },
    });

    const rawJsonText = response?.text || "";

    if (!rawJsonText.trim()) {
      throw new Error("Empty response from Gemini API");
    }

    const cleanedJsonText = fastCleanJsonString(rawJsonText);

    if (!cleanedJsonText.trim()) {
      throw new Error("Empty JSON after cleaning");
    }

    const parsedResult = JSON.parse(cleanedJsonText) as ResumeAnalysisResult;

    // Quick validation
    if (
      !parsedResult ||
      typeof parsedResult.summary !== "string" ||
      typeof parsedResult.extractedInformation !== "object" ||
      !Array.isArray(parsedResult.assignedTags)
    ) {
      throw new Error(
        "AI response format is incorrect - missing required fields"
      );
    }

    return parsedResult;
  } catch (error: any) {
    console.error("Fast Gemini analysis error:", error);

    // For sync processing, fail fast
    if (error.message.includes("JSON")) {
      throw new Error(
        "Failed to parse AI response - try async endpoint for better handling"
      );
    }

    throw error;
  }
};
