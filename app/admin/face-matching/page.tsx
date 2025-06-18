"use client";

import { useEffect, useState } from "react";
import { StoredImage, FaceMatchResult } from "../../../types";

export default function FaceMatchingPage() {
  const [storedImages, setStoredImages] = useState<StoredImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [newImageName, setNewImageName] = useState("");
  const [matchResult, setMatchResult] = useState<FaceMatchResult | null>(null);
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStoredImages();
  }, []);

  const fetchStoredImages = async () => {
    try {
      const response = await fetch("/api/admin/face-matching/images");
      if (!response.ok) throw new Error("Failed to fetch images");
      const data = await response.json();
      setStoredImages(data.images);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setImageUrl(""); // Clear URL when file is selected
      setError("");
    } else {
      setError("Please select a valid image file");
      setSelectedFile(null);
    }
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    setImageUrl(url);
    setSelectedFile(null); // Clear file when URL is entered
    setError("");
  };

  const uploadImage = async () => {
    if (!selectedFile || !newImageName.trim()) {
      setError("Please select an image and enter a name");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", newImageName);
      formData.append("image", selectedFile);
      formData.append("uploadedBy", "admin"); // In a real app, get from user context

      const response = await fetch("/api/admin/face-matching/images", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      await fetchStoredImages();
      setSelectedFile(null);
      setNewImageName("");
      setError("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const testFaceMatching = async () => {
    if (!selectedFile && !imageUrl.trim()) {
      setError("Please select an image file or enter an image URL to test");
      return;
    }

    setMatching(true);
    setError("");

    try {
      const formData = new FormData();

      if (selectedFile) {
        // Use file upload
        formData.append("image", selectedFile);
        formData.append("mimeType", selectedFile.type);
      } else if (imageUrl.trim()) {
        // Use image URL
        formData.append("imageUrl", imageUrl.trim());
      }

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

  const deleteImage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const response = await fetch(`/api/admin/face-matching/images/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete image");

      await fetchStoredImages();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-700 rounded-lg w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="backdrop-blur-xl bg-gray-800/80 border border-gray-700/50 rounded-2xl p-6"
                >
                  <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  AI Face Matching
                </h1>
                <p className="text-sm text-gray-300">
                  Advanced facial recognition
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="backdrop-blur-xl bg-gray-800/80 border border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-700/50">
              <h2 className="text-xl font-bold text-white flex items-center">
                <svg
                  className="w-6 h-6 text-[#90caf9] mr-3"
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
                Add New Face to Database
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Image Name
                  </label>
                  <input
                    type="text"
                    value={newImageName}
                    onChange={(e) => setNewImageName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#048CE7] focus:border-transparent transition-all duration-200"
                    placeholder="Enter person's name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Select Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#048CE7] file:text-white hover:file:bg-[#90caf9] transition-all duration-200"
                  />
                </div>

                <button
                  onClick={uploadImage}
                  disabled={uploading || !selectedFile || !newImageName.trim()}
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
                      Uploading...
                    </div>
                  ) : (
                    "Upload Image"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Test Matching Section */}
          <div className="backdrop-blur-xl bg-gray-800/80 border border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-700/50">
              <h2 className="text-xl font-bold text-white flex items-center">
                <svg
                  className="w-6 h-6 text-[#90caf9] mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                Test Face Matching
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Select Image File
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#048CE7] file:text-white hover:file:bg-[#90caf9] transition-all duration-200"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-800 text-gray-400">OR</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Enter Image URL
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={handleUrlChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#048CE7] focus:border-transparent transition-all duration-200"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <button
                  onClick={testFaceMatching}
                  disabled={matching || (!selectedFile && !imageUrl.trim())}
                  className="w-full bg-gradient-to-r from-[#048CE7] to-[#90caf9] text-white py-3 text-base font-semibold rounded-xl shadow-lg hover:shadow-[#048CE7]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {matching ? (
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
                      Matching...
                    </div>
                  ) : (
                    "Test Face Matching"
                  )}
                </button>

                {matchResult && (
                  <div className="mt-6 p-4 bg-gray-700/50 border border-gray-600/50 rounded-2xl">
                    <h3 className="font-semibold text-white mb-4 flex items-center">
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Results
                    </h3>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        <span className="font-medium">Description:</span>{" "}
                        {matchResult.uploadedImageDescription}
                      </p>
                      <p className="text-sm text-gray-300">
                        <span className="font-medium">Processing Time:</span>{" "}
                        {matchResult.processingTime}ms
                      </p>
                      {matchResult.matches.length > 0 ? (
                        <div>
                          <p className="text-sm font-medium text-gray-300 mb-3">
                            Matches Found:
                          </p>
                          <div className="space-y-3">
                            {matchResult.matches.map((match) => (
                              <div
                                key={`match-${match.id}`}
                                className="bg-gray-700/50 p-3 rounded-xl border border-gray-600/50"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="flex-shrink-0">
                                    <img
                                      src={
                                        match.imageUrl ||
                                        `/api/admin/face-matching/images/${match.id}/image`
                                      }
                                      alt="Matched face"
                                      className="w-12 h-12 object-cover rounded-lg border border-gray-600/50"
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
                                        <p className="text-sm font-medium text-white">
                                          {match.name || `Person ${match.id}`}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                          ID: {match.id}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <span className="text-sm font-bold text-[#90caf9]">
                                          {(
                                            match.similarityScore * 100
                                          ).toFixed(1)}
                                          % match
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-300">
                          No matches found
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stored Images Section */}
        <div className="mt-8 backdrop-blur-xl bg-gray-800/80 border border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-700/50">
            <h2 className="text-xl font-bold text-white flex items-center">
              <svg
                className="w-6 h-6 text-[#90caf9] mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Stored Images ({storedImages.length})
            </h2>
          </div>
          <div className="p-6">
            {storedImages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-400">No images stored yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {storedImages.map((image) => {
                  const imageId = image.id || image._id;
                  if (!imageId) return null;

                  return (
                    <div
                      key={imageId}
                      className="backdrop-blur-xl bg-gray-700/50 border border-gray-600/50 rounded-2xl p-6 hover:bg-gray-700/70 transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-white">
                          {image.name}
                        </h3>
                        <button
                          onClick={() => deleteImage(imageId)}
                          className="text-red-400 hover:text-red-300 text-sm p-1 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>

                      {image.imageUrl && (
                        <div className="mb-3">
                          <img
                            src={image.imageUrl}
                            alt={image.name}
                            className="w-full h-32 object-cover rounded-xl border border-gray-600/50"
                            onError={(e) => {
                              console.error(
                                `Failed to load image: ${image.imageUrl}`
                              );
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                      )}

                      <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                        {image.description.substring(0, 100)}...
                      </p>
                      <div className="text-xs text-gray-400 space-y-1">
                        <p>
                          Uploaded:{" "}
                          {new Date(image.uploadedAt).toLocaleDateString()}
                        </p>
                        <p className="truncate">URL: {image.imageUrl}</p>
                      </div>
                    </div>
                  );
                })}
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
