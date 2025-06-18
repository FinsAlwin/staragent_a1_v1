"use client";

import { useEffect, useState } from "react";
import { StoredImage, FaceMatchResult } from "../../../types";

export default function FaceMatchingPage() {
  const [storedImages, setStoredImages] = useState<StoredImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
      setError("");
    } else {
      setError("Please select a valid image file");
      setSelectedFile(null);
    }
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
    if (!selectedFile) {
      setError("Please select an image to test");
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
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">AI Face Matching</h1>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            Add New Face to Database
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image Name
              </label>
              <input
                type="text"
                value={newImageName}
                onChange={(e) => setNewImageName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter person's name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={uploadImage}
              disabled={uploading || !selectedFile || !newImageName.trim()}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : "Upload Image"}
            </button>
          </div>
        </div>

        {/* Test Matching Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Test Face Matching</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Image to Test
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={testFaceMatching}
              disabled={matching || !selectedFile}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {matching ? "Matching..." : "Test Face Matching"}
            </button>

            {matchResult && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold mb-2">Results:</h3>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Description:</strong>{" "}
                  {matchResult.uploadedImageDescription}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Processing Time:</strong> {matchResult.processingTime}
                  ms
                </p>
                {matchResult.matches.length > 0 ? (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Matches Found:
                    </p>
                    <div className="space-y-3">
                      {matchResult.matches.map((match) => (
                        <div
                          key={`match-${match.id}`}
                          className="bg-white p-3 rounded border"
                        >
                          <div className="flex items-center space-x-3">
                            {/* Display the matched image */}
                            <div className="flex-shrink-0">
                              <img
                                src={
                                  match.imageUrl ||
                                  `/api/admin/face-matching/images/${match.id}/image`
                                }
                                alt="Matched face"
                                className="w-12 h-12 object-cover rounded border"
                                onError={(e) => {
                                  console.error(
                                    `Failed to load matched image: ${match.id}`
                                  );
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            </div>

                            {/* Match details */}
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
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No matches found</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stored Images Section */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">
          Stored Images ({storedImages.length})
        </h2>

        {storedImages.length === 0 ? (
          <p className="text-gray-500">No images stored yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {storedImages.map((image) => {
              const imageId = image.id || image._id;
              if (!imageId) return null;

              return (
                <div key={imageId} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{image.name}</h3>
                    <button
                      onClick={() => deleteImage(imageId)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Display the actual image */}
                  {image.imageUrl && (
                    <div className="mb-3">
                      <img
                        src={image.imageUrl}
                        alt={image.name}
                        className="w-full h-32 object-cover rounded border"
                        onError={(e) => {
                          console.error(
                            `Failed to load image: ${image.imageUrl}`
                          );
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  <p className="text-sm text-gray-600 mb-2">
                    {image.description.substring(0, 100)}...
                  </p>
                  <p className="text-xs text-gray-500">
                    Uploaded: {new Date(image.uploadedAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400">URL: {image.imageUrl}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
