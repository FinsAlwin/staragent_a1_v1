import { GoogleGenAI, type GenerateContentResponse } from "@google/genai";
import {
  type ExtractionField,
  type Tag,
  type ResumeAnalysisResult,
} from "../types"; // Updated import path

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

const cleanJsonString = (jsonStr: string): string => {
  let cleaned = jsonStr.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/gm; // Using gm flags instead of s flag
  const match = cleaned.match(fenceRegex);
  if (match && match[2]) {
    cleaned = match[2].trim();
  }
  return cleaned;
};

export const analyzeResumeWithGemini = async (
  resumeText: string,
  fieldsToExtract: ExtractionField[],
  availableTags: Tag[]
): Promise<ResumeAnalysisResult> => {
  if (!ai) {
    throw new Error(
      "Gemini API Key is not configured or client failed to initialize. Cannot analyze resume."
    );
  }

  const fieldInstructions = fieldsToExtract
    .map(
      (field) =>
        `- "${field.key}": (${field.label}${
          field.description ? " - " + field.description : ""
        })`
    )
    .join("\\n    ");

  const tagList = availableTags.map((tag) => tag.name).join(", ");

  const prompt = `You are an expert HR assistant specializing in resume analysis.
Given the following resume text, please perform these tasks:

1.  **Summary:** Provide a concise professional summary of the candidate's profile, experience, and key skills. The summary should be between 300 and 400 words.
2.  **Information Extraction:** Extract the following pieces of information. For each field, provide the extracted value as a string. If a piece of information is not found or not applicable, use "N/A".
    ${fieldInstructions}
3.  **Tagging:** From the predefined list of tags below, assign up to 5-7 most relevant tags to this resume. Return an array of strings for the tags.
    Predefined Tags: ${tagList}

Resume Text:
---
${resumeText}
---

Please provide your response in a single, valid JSON object with the following structure:
{
  "summary": "string (300-400 words)",
  "extractedInformation": {
    ${fieldsToExtract
      .map((f) => `"${f.key}": "string (extracted value or N/A)"`)
      .join(",\\n    ")}
  },
  "assignedTags": ["string", "string", ...]
}

Ensure the keys in "extractedInformation" exactly match the requested field keys: ${fieldsToExtract
    .map((f) => `"${f.key}"`)
    .join(", ")}.
Ensure "assignedTags" is an array of strings, selected from the predefined list.
If the resume text is too short, nonsensical, or clearly not a resume, please indicate this in the summary and provide "N/A" for all extracted fields and an empty array for tags.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const rawJsonText = response?.text || "";
  const cleanedJsonText = cleanJsonString(rawJsonText);
  const parsedResult = JSON.parse(cleanedJsonText) as ResumeAnalysisResult;

  if (
    !parsedResult ||
    typeof parsedResult.summary !== "string" ||
    typeof parsedResult.extractedInformation !== "object" ||
    !Array.isArray(parsedResult.assignedTags)
  ) {
    throw new Error("AI response format is incorrect");
  }

  return parsedResult;
};

export const generateContentWithGemini = async (
  category: "Email Template" | "General",
  userPrompt: string
): Promise<string> => {
  if (!ai) {
    throw new Error(
      "Gemini API Key is not configured or client failed to initialize. Cannot generate content."
    );
  }

  let systemPrompt = "";
  if (category === "Email Template") {
    systemPrompt = `You are an expert at writing professional email content. Generate a clear, concise, and effective email body content based on the following user prompt. 
    
IMPORTANT REQUIREMENTS:
- Generate ONLY the email body content (no subject line, no "To:", "From:", "Dear", "Sincerely", "Best regards", etc.)
- The response must be between 50-100 words exactly
- Write in a professional tone
- Focus on the core message only`;
  } else {
    systemPrompt = `You are an expert content generator. Generate high-quality, relevant content based on the following user prompt.
    
IMPORTANT REQUIREMENTS:
- The response must be between 50-100 words exactly
- Write clear, concise content
- Focus on the core message only`;
  }

  const prompt = `${systemPrompt}\n\nUser prompt: ${userPrompt}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "text/plain",
      temperature: 0.7,
    },
  });

  let content = response?.text || "";

  // Clean up the content to remove any email formatting elements
  content = content
    .replace(/^(To:|From:|Subject:|Dear\s+[^,]+,\s*)/gi, "") // Remove email headers
    .replace(
      /(Sincerely|Best regards|Yours truly|Thank you|Regards)[\s,]*$/gi,
      ""
    ) // Remove email closings
    .replace(/^\s*[-–—]\s*/gm, "") // Remove leading dashes
    .trim();

  // Count words and adjust if needed
  const wordCount = content
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  if (wordCount < 50 || wordCount > 100) {
    // If word count is not in range, regenerate with more specific instructions
    const adjustedPrompt = `${systemPrompt}

CURRENT WORD COUNT: ${wordCount} words
REQUIRED: Between 50-100 words exactly

User prompt: ${userPrompt}`;

    const adjustedResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: adjustedPrompt,
      config: {
        responseMimeType: "text/plain",
        temperature: 0.7,
      },
    });

    content = adjustedResponse?.text || "";
    content = content
      .replace(/^(To:|From:|Subject:|Dear\s+[^,]+,\s*)/gi, "")
      .replace(
        /(Sincerely|Best regards|Yours truly|Thank you|Regards)[\s,]*$/gi,
        ""
      )
      .replace(/^\s*[-–—]\s*/gm, "")
      .trim();
  }

  return content;
};
