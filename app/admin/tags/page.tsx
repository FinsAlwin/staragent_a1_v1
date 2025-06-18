"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Tag {
  _id: string;
  name: string;
  description?: string;
  color: string;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const res = await fetch("/api/admin/tags");
      if (!res.ok) {
        throw new Error("Failed to fetch tags");
      }
      const data = await res.json();
      setTags(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tag?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/tags/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete tag");
      }

      // Refresh tags list
      fetchTags();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-700 rounded-lg w-1/4"></div>
            <div className="space-y-3">
              <div className="h-16 bg-gray-800 rounded-xl"></div>
              <div className="h-16 bg-gray-800 rounded-xl"></div>
              <div className="h-16 bg-gray-800 rounded-xl"></div>
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
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Tags Management
                </h1>
                <p className="text-sm text-gray-300">
                  Manage resume analysis tags
                </p>
              </div>
            </div>
            <Link
              href="/admin/tags/new"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#048CE7] to-[#90caf9] text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-[#048CE7]/50 transition-all duration-200"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add New Tag
            </Link>
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

        <div className="backdrop-blur-xl bg-gray-800/80 border border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-6">
            <div className="space-y-4">
              {tags.map((tag) => (
                <div
                  key={tag._id}
                  className="backdrop-blur-xl bg-gray-700/50 border border-gray-600/50 rounded-2xl p-6 hover:bg-gray-700/70 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-4 shadow-lg"
                        style={{ backgroundColor: tag.color }}
                      ></div>
                      <div>
                        <p className="text-lg font-semibold text-white">
                          {tag.name}
                        </p>
                        {tag.description && (
                          <p className="text-sm text-gray-300 mt-1">
                            {tag.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <Link
                        href={`/admin/tags/${tag._id}`}
                        className="inline-flex items-center px-3 py-2 border border-gray-600/50 shadow-sm text-sm font-medium rounded-xl text-gray-300 bg-gray-700/50 hover:bg-gray-600/50 hover:text-white transition-all duration-200"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(tag._id)}
                        className="inline-flex items-center px-3 py-2 border border-red-500/30 text-sm font-medium rounded-xl text-red-300 bg-red-500/20 hover:bg-red-500/30 hover:text-red-200 transition-all duration-200"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
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
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {tags.length === 0 && (
                <div className="text-center py-12">
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
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-300 mb-2">
                    No tags found
                  </h3>
                  <p className="text-gray-400">
                    Create your first tag to get started with resume analysis.
                  </p>
                </div>
              )}
            </div>
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
