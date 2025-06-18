"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface ExtractionField {
  _id: string;
  name: string;
  description?: string;
  type: "text" | "number" | "date" | "boolean" | "array";
  required: boolean;
  defaultValue?: any;
  validation?: Record<string, any>;
}

export default function EditExtractionFieldPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const isNew = params.id === "new";

  const [field, setField] = useState<Partial<ExtractionField>>({
    name: "",
    description: "",
    type: "text",
    required: false,
  });
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
      fetchField();
    }
  }, [isNew]);

  const fetchField = async () => {
    try {
      const res = await fetch(`/api/admin/extraction-fields/${params.id}`, {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        throw new Error("Failed to fetch field");
      }

      const data = await res.json();
      setField(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const url = isNew
        ? "/api/admin/extraction-fields"
        : `/api/admin/extraction-fields`;

      const res = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(isNew ? field : { ...field, id: params.id }),
      });

      if (!res.ok) {
        throw new Error("Failed to save field");
      }

      router.push("/admin/extraction-fields");
    } catch (err: any) {
      setError(err.message);
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-700 rounded-lg w-1/3"></div>
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {isNew ? "Add New Field" : "Edit Field"}
                </h1>
                <p className="text-sm text-gray-300">
                  {isNew
                    ? "Create a new extraction field"
                    : "Update field configuration"}
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

        <div className="backdrop-blur-xl bg-gray-800/80 border border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-6 p-8">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-300 mb-2"
              >
                Field Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={field.name}
                  onChange={(e) => setField({ ...field, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#048CE7] focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-gray-300 mb-2"
              >
                Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={field.description}
                  onChange={(e) =>
                    setField({ ...field, description: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#048CE7] focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="type"
                className="block text-sm font-semibold text-gray-300 mb-2"
              >
                Field Type
              </label>
              <select
                id="type"
                name="type"
                required
                value={field.type}
                onChange={(e) =>
                  setField({
                    ...field,
                    type: e.target.value as ExtractionField["type"],
                  })
                }
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#048CE7] focus:border-transparent transition-all duration-200"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="boolean">Boolean</option>
                <option value="array">Array</option>
              </select>
            </div>

            <div className="flex items-center p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl">
              <input
                id="required"
                name="required"
                type="checkbox"
                checked={field.required}
                onChange={(e) =>
                  setField({ ...field, required: e.target.checked })
                }
                className="h-5 w-5 text-[#048CE7] focus:ring-[#048CE7] border-gray-500 rounded bg-gray-600/50"
              />
              <label
                htmlFor="required"
                className="ml-3 block text-sm font-medium text-gray-300"
              >
                Required Field
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 border border-gray-600/50 shadow-sm text-sm font-medium rounded-xl text-gray-300 bg-gray-700/50 hover:bg-gray-600/50 hover:text-white transition-all duration-200"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#048CE7] to-[#90caf9] text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-[#048CE7]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSaving ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
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
                    Saving...
                  </>
                ) : (
                  <>
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Save
                  </>
                )}
              </button>
            </div>
          </form>
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
