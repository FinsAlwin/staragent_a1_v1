"use client";

import { useState } from "react";
import Image from "next/image";
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
    <div className="max-w-2xl w-full mx-auto p-8">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-[#048CE7] via-[#90caf9] to-[#8f93a9] rounded-xl flex items-center justify-center text-white text-2xl shadow-lg mr-3">
          👤
        </div>
        <h1 className="text-2xl font-bold text-white">AI Face Matching</h1>
      </div>
      <p className="text-base text-gray-300 mb-8">
        Upload an image to find similar faces in our database
      </p>

      {error && (
        <div className="bg-red-500/20 border border-red-400/30 p-4 mb-8 rounded-2xl text-red-200 animate-shake">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-red-400 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="backdrop-blur-xl bg-gray-800/80 border border-gray-700/50 rounded-3xl shadow-2xl p-8">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#048CE7] focus:border-transparent"
            />
          </div>

          <button
            onClick={handleFaceMatching}
            disabled={matching || !selectedFile}
            className="w-full bg-gradient-to-r from-[#048CE7] to-[#90caf9] text-white py-3 text-base font-semibold rounded-xl shadow-lg hover:shadow-[#048CE7]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
          >
            {matching ? "Processing..." : "Find Similar Faces"}
          </button>
        </div>

        {matchResult && (
          <div className="mt-8 bg-gray-700/50 border border-gray-600/50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#90caf9] mb-4">
              Results
            </h3>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-300 mb-2">
                  Image Description:
                </h4>
                <p className="text-sm text-gray-200 bg-gray-800/60 p-3 rounded border border-gray-700/50">
                  {matchResult.uploadedImageDescription}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-300 mb-2">
                  Processing Time:
                </h4>
                <p className="text-sm text-gray-400">
                  {matchResult.processingTime}ms
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-300 mb-2">
                  Matches Found:
                </h4>
                {matchResult.matches.length > 0 ? (
                  <div className="space-y-3">
                    {matchResult.matches.map((match) => (
                      <div
                        key={`match-${match.id}`}
                        className="bg-gray-800/60 p-4 rounded border border-gray-700/50"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <Image
                              src={
                                match.imageUrl ||
                                `/api/admin/face-matching/images/${match.id}/image`
                              }
                              alt="Matched face"
                              width={64}
                              height={64}
                              className="w-16 h-16 object-cover rounded border border-gray-700/50"
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
                                <p className="text-sm font-medium text-gray-200">
                                  {match.name || `Person ${match.id}`}
                                </p>
                                <p className="text-xs text-gray-400">
                                  ID: {match.id}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-bold text-green-400">
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
                  <p className="text-sm text-gray-400 bg-gray-800/60 p-3 rounded border border-gray-700/50">
                    No similar faces found in the database
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-400">
          This demo uses AI to analyze facial features and find similar faces.
          <br />
          For admin access, visit{" "}
          <a
            href="/admin/face-matching"
            className="text-[#048CE7] hover:text-[#90caf9] underline"
          >
            the admin panel
          </a>
          .
        </p>
      </div>
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
