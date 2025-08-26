"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface ExtractionField {
  id: string;
  key: string;
  label: string;
  description?: string;
}

interface Tag {
  id: string;
  name: string;
}

interface AnalysisResult {
  summary: string;
  extractedInformation: Record<string, string>;
  assignedTags: string[];
  analyzedAt: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [extractionFields, setExtractionFields] = useState<ExtractionField[]>(
    []
  );
  const [tags, setTags] = useState<Tag[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Fetch user profile and data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("token");
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // Fetch user profile to determine role
        const profileRes = await fetch("/api/user/profile", { headers });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUserRole(profileData.user?.role);
        }

        const [fieldsRes, tagsRes] = await Promise.all([
          fetch("/api/extraction-fields", { headers }),
          fetch("/api/tags", { headers }),
        ]);

        if (fieldsRes.ok) {
          const fieldsData = await fieldsRes.json();
          setExtractionFields(fieldsData.extractionFields || []);
        } else {
          console.error("Failed to fetch extraction fields:", fieldsRes.status);
        }

        if (tagsRes.ok) {
          const tagsData = await tagsRes.json();
          setTags(tagsData.tags || []);
        } else {
          console.error("Failed to fetch tags:", tagsRes.status);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
      setSuccess("");
      setAnalysisResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    // Check if we have the required data
    if (extractionFields.length === 0) {
      setError(
        "No extraction fields available. Please contact an administrator."
      );
      return;
    }

    if (tags.length === 0) {
      setError("No tags available. Please contact an administrator.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("extractionFields", JSON.stringify(extractionFields));
      formData.append("tags", JSON.stringify(tags));

      const token = Cookies.get("token");
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        let errorMessage = "Failed to analyze resume";

        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // If we can't parse the error response, use the status text
          if (res.status === 422) {
            errorMessage =
              "AI analysis failed due to response format issues. Please try again.";
          } else if (res.status === 503) {
            errorMessage =
              "AI service is temporarily unavailable. Please try again in a few moments.";
          } else if (res.status === 500) {
            errorMessage =
              "An internal server error occurred. Please try again.";
          } else {
            errorMessage = `Server error (${res.status}): ${res.statusText}`;
          }
        }

        throw new Error(errorMessage);
      }

      let result;
      try {
        result = await res.json();
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        throw new Error(
          "Received invalid response from server. Please try again."
        );
      }

      // Validate the result structure
      if (
        !result ||
        typeof result.summary !== "string" ||
        !result.extractedInformation ||
        !Array.isArray(result.assignedTags)
      ) {
        console.error("Invalid result structure:", result);
        throw new Error(
          "Received incomplete analysis results. Please try again."
        );
      }

      setAnalysisResult(result);
      setSuccess("Resume analyzed successfully!");
      setFile(null);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-xl shadow-lg border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-[#048CE7] via-[#90caf9] to-[#8f93a9] rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Upload Resume</h1>
                <p className="text-sm text-gray-300">
                  AI-powered resume analysis
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-2xl backdrop-blur-sm animate-shake">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-400 mr-3 animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-red-200 font-medium">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-400/30 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-green-400 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-green-200 font-medium">{success}</p>
            </div>
          </div>
        )}

        <div className="backdrop-blur-xl bg-gray-800/80 border border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-[#048CE7] via-[#90caf9] to-[#8f93a9] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Upload Your Resume
              </h2>
              <p className="text-gray-300">
                Get AI-powered insights and analysis
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-gray-600/50 rounded-xl p-8 text-center hover:border-[#048CE7] transition-all duration-200 bg-gray-700/30">
                <div className="space-y-4">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-[#90caf9] font-semibold hover:text-[#048CE7] transition-colors duration-200">
                        Choose a file
                      </span>
                      <span className="text-gray-400"> or drag and drop</span>
                    </label>
                  </div>
                  <p className="text-sm text-gray-400">
                    PDF, DOC, DOCX up to 10MB
                  </p>
                  {file && (
                    <div className="mt-4 p-3 bg-green-500/20 border border-green-400/30 rounded-lg">
                      <div className="flex items-center">
                        <svg
                          className="w-5 h-5 text-green-400 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-sm font-medium text-green-200">
                          {file.name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Debug Information */}
              <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Extraction Fields:</span>
                    <span className="ml-2 font-medium text-[#90caf9]">
                      {extractionFields.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Available Tags:</span>
                    <span className="ml-2 font-medium text-[#90caf9]">
                      {tags.length}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  !file ||
                  uploading ||
                  extractionFields.length === 0 ||
                  tags.length === 0
                }
                className="w-full bg-gradient-to-r from-[#048CE7] to-[#90caf9] text-white py-3 text-base font-semibold rounded-xl shadow-lg hover:shadow-[#048CE7]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {uploading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Analyzing...
                  </div>
                ) : (
                  "Analyze Resume"
                )}
              </button>
            </form>

            {/* Analysis Results */}
            {analysisResult && (
              <div className="mt-8 space-y-6">
                <div className="border-t border-gray-700/50 pt-8">
                  <h3 className="text-xl font-bold text-white mb-6">
                    Analysis Results
                  </h3>

                  {/* Summary */}
                  <div className="backdrop-blur-xl bg-gray-800/80 border border-gray-700/50 rounded-2xl shadow-lg mb-6">
                    <div className="p-6 border-b border-gray-700/50">
                      <h4 className="text-lg font-semibold text-white flex items-center">
                        <svg
                          className="w-5 h-5 text-[#90caf9] mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Summary
                      </h4>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-300 leading-relaxed">
                        {analysisResult.summary}
                      </p>
                    </div>
                  </div>

                  {/* Extracted Information */}
                  <div className="backdrop-blur-xl bg-gray-800/80 border border-gray-700/50 rounded-2xl shadow-lg mb-6">
                    <div className="p-6 border-b border-gray-700/50">
                      <h4 className="text-lg font-semibold text-white flex items-center">
                        <svg
                          className="w-5 h-5 text-[#90caf9] mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Extracted Information
                      </h4>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(
                          analysisResult.extractedInformation
                        ).map(([key, value]) => (
                          <div
                            key={key}
                            className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50"
                          >
                            <dt className="text-sm font-medium text-gray-400 mb-1">
                              {key}
                            </dt>
                            <dd className="text-sm text-white font-medium">
                              {value || "Not found"}
                            </dd>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Assigned Tags */}
                  <div className="backdrop-blur-xl bg-gray-800/80 border border-gray-700/50 rounded-2xl shadow-lg mb-6">
                    <div className="p-6 border-b border-gray-700/50">
                      <h4 className="text-lg font-semibold text-white flex items-center">
                        <svg
                          className="w-5 h-5 text-[#90caf9] mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                          />
                        </svg>
                        Assigned Tags
                      </h4>
                    </div>
                    <div className="p-6">
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.assignedTags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-[#048CE7] to-[#90caf9] text-white shadow-lg"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Analysis Time */}
                  <div className="text-center text-sm text-gray-400">
                    Analyzed at:{" "}
                    {new Date(analysisResult.analyzedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
