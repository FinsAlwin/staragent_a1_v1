import { GoogleGenAI } from "@google/genai";
import { GEMINI_TEXT_MODEL, GEMINI_API_KEY_ERROR } from "../constants";
import type {
  GeminiSimilarityItem,
  FaceDescriptionRequest,
  SimilarityRequest,
} from "../types";
import connectDB from "../lib/db";
import StoredImage from "../models/StoredImage";
// Types are for JSDoc, not runtime
/** @typedef {import('../types').StoredImage} StoredImage */
/** @typedef {import('../types').GeminiSimilarityItem} GeminiSimilarityItem */
/** @typedef {import('../types').FaceDescriptionRequest} FaceDescriptionRequest */
/** @typedef {import('../types').SimilarityRequest} SimilarityRequest */
/** @typedef {import('@google/genai').GenerateContentResponse} GenerateContentResponse */

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.error(GEMINI_API_KEY_ERROR);
}

/**
 * Gets a description of an image using the Gemini API.
 * @param base64Image Base64 encoded image string.
 * @param mimeType The MIME type of the image.
 * @returns A promise that resolves to the image description.
 * @throws {Error} If API key is not set or Gemini API call fails.
 */
const getImageDescription = async (
  base64Image: string,
  mimeType: string
): Promise<string> => {
  if (!ai) throw new Error(GEMINI_API_KEY_ERROR);

  // Validate input parameters
  if (!base64Image || base64Image.length === 0) {
    throw new Error("Empty or invalid base64 image data");
  }

  if (!mimeType || !mimeType.startsWith("image/")) {
    throw new Error("Invalid MIME type. Must be an image type.");
  }

  console.log(
    `Getting image description for ${mimeType} image (${base64Image.length} chars)`
  );

  const imagePart = {
    inlineData: {
      mimeType: mimeType,
      data: base64Image,
    },
  };
  const textPart = {
    text: "Describe the prominent facial features in this image in detail. Focus on unique identifiers like eye shape and color, nose structure, mouth shape, jawline, hair color and style, and any distinct marks (scars, moles, tattoos). If no clear human face is detected, respond with 'No clear human face detected.' Your description should be objective and suitable for facial comparison.",
  };

  const request: FaceDescriptionRequest = {
    model: GEMINI_TEXT_MODEL,
    contents: { parts: [imagePart, textPart] },
  };

  try {
    console.log("Sending request to Gemini API...");
    const response = await ai.models.generateContent(request);
    const description = response.text?.trim() || "No description generated";
    console.log(`Received description: ${description.substring(0, 100)}...`);
    return description;
  } catch (error) {
    console.error("Error getting image description from Gemini:", error);
    throw new Error("Failed to get image description from AI.");
  }
};

/**
 * Fetches stored images directly from the database
 * @returns Promise that resolves to an array of stored images
 */
const getStoredImages = async () => {
  try {
    console.log("Connecting to database to fetch stored images...");
    await connectDB();

    const images = await StoredImage.find({ isActive: true })
      .sort({ uploadedAt: -1 })
      .select("-__v");

    console.log(
      `Database query completed. Found ${images.length} active images`
    );

    // Map _id to id for consistency
    const mappedImages = images.map((img) => ({
      id: img._id,
      _id: img._id,
      name: img.name,
      description: img.description,
      imageUrl: img.imageUrl,
      uploadedAt: img.uploadedAt,
      uploadedBy: img.uploadedBy,
      isActive: img.isActive,
    }));

    console.log(`Successfully mapped ${mappedImages.length} stored images`);
    return mappedImages;
  } catch (error) {
    console.error("Error fetching stored images from database:", error);
    return [];
  }
};

/**
 * Finds similar faces by comparing a description against a database of descriptions using Gemini API.
 * @param uploadedImageDescription Description of the uploaded image's facial features.
 * @returns A promise that resolves to an array of objects with id and similarityScore.
 * @throws {Error} If API key is not set or Gemini API call fails or returns malformed data.
 */
const findSimilarFaces = async (
  uploadedImageDescription: string
): Promise<GeminiSimilarityItem[]> => {
  if (!ai) throw new Error(GEMINI_API_KEY_ERROR);

  // Fetch stored images from database
  const storedImages = await getStoredImages();

  if (storedImages.length === 0) {
    console.log("No stored images found in database");
    return [];
  }

  const databaseFaceData = storedImages.map((img: any) => ({
    id: img._id || img.id,
    name: img.name,
    description: img.description,
  }));

  console.log(`Comparing against ${databaseFaceData.length} stored images`);

  const prompt = `
    You are a highly advanced facial recognition AI.
    An image has been uploaded, and its facial features are described as:
    "${uploadedImageDescription}"

    Your task is to compare this description against the following database of facial descriptions:
    ${JSON.stringify(databaseFaceData)}

    Carefully analyze the similarities between the uploaded image's description and each description in the database.
    Respond with a JSON array of objects. Each object in the array must contain:
    1.  "id": The 'id' of the matching image from the database.
    2.  "name": The 'name' of the matching image from the database.
    3.  "similarityScore": A numerical score between 0.0 and 1.0 (inclusive), where 1.0 represents a perfect or extremely high similarity, and 0.0 represents no similarity.

    Only include images in your response that have a similarityScore strictly greater than 0.5.
    If no images in the database meet this similarity threshold, return an empty JSON array: [].

    The output MUST be a valid JSON array. For example:
    [
      {"id": "person1", "name": "John Doe", "similarityScore": 0.85},
      {"id": "person3", "name": "Jane Smith", "similarityScore": 0.65}
    ]
    Or, if no matches:
    []
  `;

  const request: SimilarityRequest = {
    model: GEMINI_TEXT_MODEL,
    contents: { parts: [{ text: prompt }] },
    config: {
      responseMimeType: "application/json",
    },
  };

  try {
    const response = await ai.models.generateContent(request);
    let jsonStr = response.text?.trim() || "";

    const fenceRegex = /^```(\w*)?\s*\n?([\s\S]*?)\n?\s*```$/;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    if (jsonStr === "```json" || jsonStr === "```" || jsonStr === "") {
      console.warn(
        "Gemini returned an empty or malformed JSON shell. Interpreting as no matches."
      );
      return [];
    }

    const parsedData = JSON.parse(jsonStr);

    if (
      Array.isArray(parsedData) &&
      parsedData.every(
        (item) =>
          typeof item.id === "string" &&
          typeof item.name === "string" &&
          typeof item.similarityScore === "number" &&
          item.similarityScore >= 0 &&
          item.similarityScore <= 1
      )
    ) {
      console.log(`Found ${parsedData.length} matches`);
      return parsedData;
    } else {
      console.error("Parsed data is not in the expected format:", parsedData);
      throw new Error("AI returned similarity data in an unexpected format.");
    }
  } catch (error: any) {
    // Attempt to log raw text if available from the error object
    const rawText =
      error.response && error.response.text
        ? error.response.text
        : "N/A (or not available in error object)";
    console.error(
      "Error finding similar faces from Gemini:",
      error,
      "Raw text was:",
      rawText
    );
    throw new Error(
      `AI failed to return valid similarity data. Error: ${error.message}`
    );
  }
};

const isApiKeySet = () => !!ai;

export { getImageDescription, findSimilarFaces, isApiKeySet };
