"use client";

import { useState } from "react";
import { FaceMatchResult } from "../../types";

export default function FaceMatchingPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [matchResult, setMatchResult] = useState<FaceMatchResult | null>(null);
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setError("");
    } else {
      setError("Please select a valid image file");
      setSelectedFile(null);
    }
  };

  const handleFaceMatching = async () => {
    if (!selectedFile) {
      setError("Please select an image first");
      return;
    }

    setMatching(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("mimeType", selectedFile.type);

      const response = await fetch("/api/face-matching/match", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to match faces");
      }

      const result = await response.json();
      setMatchResult(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setMatching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Face Matching
          </h1>
          <p className="text-xl text-gray-600">
            Upload an image to find similar faces in our database
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
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

        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleFaceMatching}
              disabled={matching || !selectedFile}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {matching ? "Processing..." : "Find Similar Faces"}
            </button>
          </div>

          {matchResult && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Results
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">
                    Image Description:
                  </h4>
                  <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                    {matchResult.uploadedImageDescription}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">
                    Processing Time:
                  </h4>
                  <p className="text-sm text-gray-600">
                    {matchResult.processingTime}ms
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">
                    Matches Found:
                  </h4>
                  {matchResult.matches.length > 0 ? (
                    <div className="space-y-3">
                      {matchResult.matches.map((match) => (
                        <div
                          key={`match-${match.id}`}
                          className="bg-white p-4 rounded border"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <img
                                src={`/api/admin/face-matching/images/${match.id}/image`}
                                alt="Matched face"
                                className="w-16 h-16 object-cover rounded border"
                                onError={(e) => {
                                  console.error(
                                    `Failed to load matched image: ${match.id}`
                                  );
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            </div>

                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {match.name || `Person ${match.id}`}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    ID: {match.id}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className="text-sm font-bold text-green-600">
                                    {(match.similarityScore * 100).toFixed(1)}%
                                    match
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 bg-white p-3 rounded border">
                      No similar faces found in the database
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            This demo uses AI to analyze facial features and find similar faces.
            <br />
            For admin access, visit{" "}
            <a
              href="/admin/face-matching"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              the admin panel
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
