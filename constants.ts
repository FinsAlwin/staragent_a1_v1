import { UserRole, type ExtractionField, type Tag } from "./types";

export const APP_NAME = "Star Agent AI";

export const DEFAULT_EXTRACTION_FIELDS: ExtractionField[] = [
  {
    id: "1",
    key: "candidateName",
    label: "Candidate Name",
    description: "The full name of the candidate.",
  },
  {
    id: "2",
    key: "emailAddress",
    label: "Email Address",
    description: "The primary email address of the candidate.",
  },
  {
    id: "3",
    key: "phoneNumber",
    label: "Phone Number",
    description: "The primary phone number of the candidate.",
  },
  {
    id: "4",
    key: "linkedInProfile",
    label: "LinkedIn Profile URL",
    description: "URL of the candidate's LinkedIn profile.",
  },
  {
    id: "5",
    key: "yearsOfExperience",
    label: "Total Years of Experience",
    description: "The total number of years of professional experience.",
  },
  {
    id: "6",
    key: "topSkills",
    label: "Top Skills (comma-separated)",
    description: "A list of the candidate's most prominent skills.",
  },
];

export const DEFAULT_TAGS: Tag[] = [
  { id: "1", name: "JavaScript" },
  { id: "2", name: "TypeScript" },
  { id: "3", name: "React" },
  { id: "4", name: "Node.js" },
  { id: "5", name: "Python" },
  { id: "6", name: "Java" },
  { id: "7", name: "Project Management" },
  { id: "8", name: "Agile" },
  { id: "9", name: "Software Development" },
  { id: "10", name: "Data Analysis" },
  { id: "11", name: "UX/UI Design" },
  { id: "12", name: "Senior Developer" },
  { id: "13", name: "Junior Developer" },
  { id: "14", name: "Cloud Computing" },
  { id: "15", name: "DevOps" },
];

export const MOCK_USERS = {
  admin: { id: "admin001", username: "Admin User", role: UserRole.ADMIN },
  user: { id: "user001", username: "Regular User", role: UserRole.USER },
};

// AI Face Matching Constants
export const GEMINI_TEXT_MODEL = "gemini-2.5-pro";
export const GEMINI_API_KEY_ERROR =
  "Gemini API key is not set. Please set the NEXT_PUBLIC_GEMINI_API_KEY environment variable.";
