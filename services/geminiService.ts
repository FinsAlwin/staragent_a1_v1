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

// Use latest fastest model for best performance
const GEMINI_MODEL = "gemini-2.5-flash"; // Latest Gemini 2.5 Flash model

const cleanJsonString = (jsonStr: string): string => {
  let cleaned = jsonStr.trim();

  // Remove markdown code blocks
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/gm;
  const match = cleaned.match(fenceRegex);
  if (match && match[2]) {
    cleaned = match[2].trim();
  }

  // Remove any text before the first {
  const firstBraceIndex = cleaned.indexOf("{");
  if (firstBraceIndex > 0) {
    cleaned = cleaned.substring(firstBraceIndex);
  }

  // Remove any text after the last }
  const lastBraceIndex = cleaned.lastIndexOf("}");
  if (lastBraceIndex > 0 && lastBraceIndex < cleaned.length - 1) {
    cleaned = cleaned.substring(0, lastBraceIndex + 1);
  }

  // Remove common prefixes that AI models sometimes add
  const prefixes = [
    "Here is the analysis in JSON format:",
    "Here is the JSON response:",
    "The analysis results are:",
    "JSON Response:",
    "Analysis Results:",
    "Here is the resume analysis:",
  ];

  for (const prefix of prefixes) {
    if (cleaned.startsWith(prefix)) {
      cleaned = cleaned.substring(prefix.length).trim();
      break;
    }
  }

  // Remove common suffixes
  const suffixes = [
    "This analysis provides a comprehensive overview of the candidate.",
    "The above analysis covers all requested information.",
    "This completes the resume analysis.",
    "End of analysis.",
  ];

  for (const suffix of suffixes) {
    if (cleaned.endsWith(suffix)) {
      cleaned = cleaned.substring(0, cleaned.length - suffix.length).trim();
      break;
    }
  }

  // Ensure the string starts and ends with braces
  if (!cleaned.startsWith("{")) {
    cleaned = "{" + cleaned;
  }
  if (!cleaned.endsWith("}")) {
    cleaned = cleaned + "}";
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

  const prompt = `Analyze this resume and extract information. Return ONLY valid JSON.

Tasks:
1. Summary: 200-300 word professional summary
2. Extract: ${fieldInstructions}
3. Tags: Select 3-5 relevant tags from: ${tagList}

Resume:
${resumeText}

JSON format:
{
  "summary": "string",
  "extractedInformation": {
    ${fieldsToExtract
      .map((f) => `"${f.key}": "string or N/A"`)
      .join(",\\n    ")}
  },
  "assignedTags": ["string", ...]
}

Use "N/A" for missing info. Select tags from: ${tagList}`;

  // Retry logic for malformed JSON responses
  let attempts = 0;
  const maxAttempts = 2; // Reduced from 3 to 2 for faster response

  while (attempts < maxAttempts) {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1, // Lower temperature for faster, more consistent responses
          maxOutputTokens: 2048, // Limit output for faster response
        },
      });

      const rawJsonText = response?.text || "";

      if (!rawJsonText.trim()) {
        throw new Error("Empty response from Gemini API");
      }

      const cleanedJsonText = cleanJsonString(rawJsonText);

      if (!cleanedJsonText.trim()) {
        throw new Error("Empty JSON after cleaning");
      }

      // Try to parse the JSON
      let parsedResult: ResumeAnalysisResult;
      try {
        parsedResult = JSON.parse(cleanedJsonText) as ResumeAnalysisResult;
      } catch (parseError) {
        console.error(
          `JSON parse error on attempt ${attempts + 1}:`,
          parseError
        );
        console.error("Raw response:", rawJsonText);
        console.error("Cleaned response:", cleanedJsonText);

        if (attempts === maxAttempts - 1) {
          throw new Error(
            `Failed to parse JSON response after ${maxAttempts} attempts. Last error: ${parseError}`
          );
        }

        attempts++;
        continue;
      }

      // Validate the parsed result structure
      if (
        !parsedResult ||
        typeof parsedResult.summary !== "string" ||
        typeof parsedResult.extractedInformation !== "object" ||
        !Array.isArray(parsedResult.assignedTags)
      ) {
        console.error("Invalid response structure:", parsedResult);

        if (attempts === maxAttempts - 1) {
          throw new Error(
            "AI response format is incorrect - missing required fields"
          );
        }

        attempts++;
        continue;
      }

      // Validate that all required extraction fields are present
      const missingFields = fieldsToExtract.filter(
        (field) => !(field.key in parsedResult.extractedInformation)
      );

      if (missingFields.length > 0) {
        console.error("Missing extraction fields:", missingFields);

        if (attempts === maxAttempts - 1) {
          throw new Error(
            `Missing required extraction fields: ${missingFields
              .map((f) => f.key)
              .join(", ")}`
          );
        }

        attempts++;
        continue;
      }

      return parsedResult;
    } catch (error: any) {
      console.error(`Error on attempt ${attempts + 1}:`, error);

      if (attempts === maxAttempts - 1) {
        throw error;
      }

      attempts++;

      // Wait a bit before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
    }
  }

  throw new Error(
    "Failed to get valid response from Gemini API after all retry attempts"
  );
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
    model: GEMINI_MODEL,
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
      model: GEMINI_MODEL,
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
