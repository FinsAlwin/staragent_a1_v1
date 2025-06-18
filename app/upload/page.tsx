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
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to analyze resume");
      }

      const result = await res.json();
      setAnalysisResult(result);
      setSuccess("Resume analyzed successfully!");
      setFile(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleBackToDashboard = () => {
    const dashboardPath =
      userRole === "admin" ? "/admin/dashboard" : "/dashboard";
    router.push(dashboardPath);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-10">
        <header className="mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              Upload Resume
            </h1>
            <button
              onClick={handleBackToDashboard}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Back to Dashboard
            </button>
          </div>
        </header>

        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Upload Your Resume
                </h3>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-green-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700">{success}</p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Select Resume File
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                            <span>Upload a file</span>
                            <input
                              type="file"
                              className="sr-only"
                              accept=".pdf,.doc,.docx"
                              onChange={handleFileChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF, DOC, DOCX up to 10MB
                        </p>
                        {file && (
                          <p className="text-sm text-gray-900">
                            Selected: {file.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Debug Information */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Loaded {extractionFields.length} extraction fields</p>
                    <p>Loaded {tags.length} tags</p>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      !file ||
                      uploading ||
                      extractionFields.length === 0 ||
                      tags.length === 0
                    }
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {uploading ? "Analyzing..." : "Analyze Resume"}
                  </button>
                </form>

                {/* Analysis Results */}
                {analysisResult && (
                  <div className="mt-8 bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Analysis Results
                    </h3>

                    {/* Summary */}
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-700 mb-2">
                        Summary
                      </h4>
                      <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                        {analysisResult.summary}
                      </p>
                    </div>

                    {/* Extracted Information */}
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-700 mb-2">
                        Extracted Information
                      </h4>
                      <div className="bg-white rounded border overflow-hidden">
                        {Object.entries(
                          analysisResult.extractedInformation
                        ).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex border-b last:border-b-0"
                          >
                            <div className="w-1/3 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">
                              {key}
                            </div>
                            <div className="w-2/3 px-3 py-2 text-sm text-gray-900">
                              {value || "Not found"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Assigned Tags */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">
                        Assigned Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.assignedTags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Analysis Time */}
                    <div className="text-xs text-gray-500">
                      Analyzed at:{" "}
                      {new Date(analysisResult.analyzedAt).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
