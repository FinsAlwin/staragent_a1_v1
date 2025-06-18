export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export interface User {
  id: string;
  username: string; // For display, not real auth
  role: UserRole;
}

export interface ExtractionField {
  id: string;
  key: string; // e.g., "candidateName", "emailAddress"
  label: string; // e.g., "Candidate Name", "Email Address"
  description?: string; // Optional description for AI guidance
}

export interface Tag {
  id: string;
  name: string; // e.g., "JavaScript", "Project Management"
}

export interface ResumeAnalysisResult {
  summary: string;
  extractedInformation: Record<string, string>;
  assignedTags: string[];
}

export interface AppState {
  currentUser: User | null;
  extractionFields: ExtractionField[];
  tags: Tag[];
}

export type AppAction =
  | { type: "LOGIN"; payload: User }
  | { type: "LOGOUT" }
  | { type: "SET_EXTRACTION_FIELDS"; payload: ExtractionField[] }
  | { type: "ADD_EXTRACTION_FIELD"; payload: ExtractionField }
  | { type: "UPDATE_EXTRACTION_FIELD"; payload: ExtractionField }
  | { type: "DELETE_EXTRACTION_FIELD"; payload: string } // id
  | { type: "SET_TAGS"; payload: Tag[] }
  | { type: "ADD_TAG"; payload: Tag }
  | { type: "UPDATE_TAG"; payload: Tag }
  | { type: "DELETE_TAG"; payload: string }; // id

export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

// For Gemini Search Grounding (if used, but not in this specific request for resume analysis)
export interface GroundingChunkWeb {
  uri: string;
  title: string;
}
export interface GroundingChunk {
  web?: GroundingChunkWeb;
  // Other types of chunks if applicable
}
export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  // Other metadata fields
}
export interface Candidate {
  groundingMetadata?: GroundingMetadata;
  // Other candidate fields
}
export interface GenerateContentResponseWithGrounding {
  text: string;
  candidates?: Candidate[];
  // Other response fields
}

// AI Face Matching Types
export interface StoredImage {
  id?: string;
  _id?: string;
  name: string;
  description: string;
  imageUrl: string;
  s3Key?: string; // S3 object key for deletion
  uploadedAt: Date;
  uploadedBy: string;
}

export interface GeminiSimilarityItem {
  id: string;
  name?: string; // Optional name field for displaying matched face names
  imageUrl?: string; // S3 URL for displaying the matched image
  similarityScore: number;
}

export interface FaceDescriptionRequest {
  model: string;
  contents: {
    parts: Array<{
      inlineData?: {
        mimeType: string;
        data: string;
      };
      text?: string;
    }>;
  };
}

export interface SimilarityRequest {
  model: string;
  contents: {
    parts: Array<{
      text: string;
    }>;
  };
  config?: {
    responseMimeType: string;
  };
}

export interface FaceMatchResult {
  uploadedImageDescription: string;
  matches: GeminiSimilarityItem[];
  processingTime: number;
}

export interface FaceMatchRequest {
  image: string; // base64 encoded image
  mimeType: string;
}
