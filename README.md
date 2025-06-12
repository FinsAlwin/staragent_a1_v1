# AI Resume Analyzer (Next.js Version)

This application allows users to upload resumes (PDF or DOCX format) for AI-powered analysis using Google Gemini. The AI provides a summary, extracts key information based on a customizable list, and assigns relevant tags from a predefined set.

Admins can manage the list of information fields to be extracted and the predefined tags through an admin panel.

**All processing is done in-memory on the client-side for Phase 1. Resumes and extracted data are NOT stored on any server or database yet.** MongoDB integration is planned for future phases.

## Features

*   **Resume Upload:** Supports PDF and DOCX file formats.
*   **AI Analysis (via Gemini API):**
    *   Generates a 300-400 word summary.
    *   Extracts specific information (e.g., name, email, experience).
    *   Assigns relevant tags.
*   **Client-Side Processing:** Resume text parsing and AI API calls are initiated from the client-side in Phase 1.
*   **Mock Authentication:** Simple role-based access (User/Admin) for demonstration.
*   **Admin Panel:**
    *   Manage extraction fields (add, edit, delete).
    *   Manage predefined tags (add, edit, delete).
*   **Responsive UI:** Styled with Tailwind CSS (via CDN in Phase 1).
*   **Next.js Framework:** Provides structure, routing, and build optimizations.

## Tech Stack (Phase 1)

*   Next.js 14
*   React 18 (TypeScript)
*   Tailwind CSS (CDN)
*   Google Gemini API (`@google/genai`)
*   `pdf.js` (for PDF parsing, via CDN)
*   `mammoth.js` (for DOCX parsing, via CDN)
*   Client-side state management (React Context, `localStorage` for admin settings and user session)

## Setup and Running

1.  **Prerequisites:**
    *   Node.js (version 18.x or later recommended)
    *   npm or yarn
    *   A Google Gemini API Key.
    *   A MongoDB connection string (placeholder for now, will be used in later phases).

2.  **Clone the Repository (if applicable) or Setup Files:**
    Ensure you have all the project files as provided.

3.  **Install Dependencies:**
    Navigate to the project root directory in your terminal and run:
    ```bash
    npm install
    # or
    # yarn install
    ```

4.  **Configure Environment Variables:**
    *   Create a file named `.env.local` in the root of your project.
    *   Add the following content, replacing the placeholder values with your actual credentials:

        ```env
        # Replace with your actual Google Gemini API Key
        NEXT_PUBLIC_GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"

        # Replace with your actual MongoDB connection string (will be used in later phases)
        MONGODB_URI="YOUR_MONGODB_CONNECTION_STRING_HERE"
        ```
    *   **Security Note:** `NEXT_PUBLIC_GEMINI_API_KEY` makes the API key available on the client-side. For production, it's highly recommended to proxy Gemini API calls through a Next.js API route to keep the key secure on the server. This will be addressed in a later phase.

5.  **Run the Development Server:**
    ```bash
    npm run dev
    # or
    # yarn dev
    ```
    This will start the Next.js development server, typically on `http://localhost:3000`.

6.  **Open in Browser:**
    Open `http://localhost:3000` in your web browser.

## Usage

### User Role

1.  On the login screen, select the "User" role.
2.  Click "Login as User".
3.  You will be taken to the resume upload form.
4.  Click "Upload a file" or drag and drop a PDF or DOCX resume.
5.  Click "Analyze Resume".
6.  Wait for the analysis to complete. The results (summary, extracted information, tags) will be displayed below the form.

### Admin Role

1.  On the login screen, select the "Admin" role.
2.  Click "Login as Admin".
3.  You will be taken to the resume upload form by default. Click "Admin Panel" in the navbar.
4.  **Manage Extraction Fields:**
    *   View, add, edit, or delete fields that the AI will try to extract from resumes.
    *   Each field needs a "Label" (user-friendly name) and a "Key" (for JSON, auto-generated from label). An optional "Description" can guide the AI.
5.  **Manage Predefined Tags:**
    *   View, add, edit, or delete tags that the AI can assign to resumes.
6.  Changes made in the admin panel are saved to the browser's `localStorage` and will persist for subsequent sessions on the same browser.
7.  Admins can also use the "Resume Analyzer" view to test uploads with the current configuration of fields and tags.

### API Interaction (Gemini API Call - Client-Side in Phase 1)

The core "API" interaction is the client-side call to the Google Gemini API.

**Request (to Gemini API, constructed by `services/geminiService.ts`):**

The application sends a structured prompt to the Gemini API (`gemini-2.5-flash-preview-04-17` model) including:
*   The extracted text content of the resume.
*   Instructions to generate a summary.
*   A list of fields to extract (defined by the admin), including their keys, labels, and descriptions.
*   A list of predefined tags (defined by the admin).
*   A request for the response to be in JSON format with a specific structure.

**Example Gemini Prompt Snippet:**
```
You are an expert HR assistant...
1.  **Summary:** ... (300-400 words)
2.  **Information Extraction:**
    - "candidateName": (Candidate Name - The full name of the candidate.)
    - "emailAddress": (Email Address - The primary email address of the candidate.)
    ...
3.  **Tagging:** Predefined Tags: JavaScript, React, Python, ...

Resume Text:
---
[Full text of the resume]
---

Please provide your response in a single, valid JSON object with the following structure:
{
  "summary": "string",
  "extractedInformation": {
    "candidateName": "string",
    "emailAddress": "string",
    ...
  },
  "assignedTags": ["string", ...]
}
```

**Response (from Gemini API, parsed by the application):**

The application expects a JSON response from Gemini matching the requested structure. This JSON data is then displayed on the user interface.
No resume data is stored persistently by the application itself in Phase 1, except for admin configurations in `localStorage`.
