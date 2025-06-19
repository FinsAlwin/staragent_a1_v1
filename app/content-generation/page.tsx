"use client";
import React, { useState } from "react";

const categories = ["Email Template", "General"];

export default function ContentGenerationPage() {
  const [category, setCategory] = useState(categories[0]);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setResult("");
    try {
      const res = await fetch("/api/content-generation/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate content");
      setResult(data.content);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="max-w-xl w-full mx-auto p-8">
      <div className="flex items-center mb-2">
        <div className="w-10 h-10 bg-gradient-to-r from-[#048CE7] via-[#90caf9] to-[#8f93a9] rounded-xl flex items-center justify-center text-white text-2xl shadow-lg mr-3">
          📝
        </div>
        <h1 className="text-2xl font-bold text-white">Content Generation</h1>
      </div>
      <p className="text-gray-400 mb-8 text-sm pl-1">
        Instantly generate professional content using AI. Select a category and
        enter your prompt below.
      </p>
      <div className="backdrop-blur-xl bg-gray-800/80 border border-gray-700/50 rounded-3xl shadow-2xl p-8 mb-8">
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-gray-300">
            Category
          </label>
          <select
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#048CE7] focus:border-transparent transition-all duration-200"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-gray-300">
            Prompt
          </label>
          <textarea
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#048CE7] focus:border-transparent transition-all duration-200"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
          />
          <p className="text-xs text-gray-500 mt-1 pl-1">
            Describe what you want to generate. Be specific for best results.
          </p>
        </div>
        <button
          className="w-full bg-gradient-to-r from-[#048CE7] to-[#90caf9] text-white py-3 text-base font-semibold rounded-xl shadow-lg hover:shadow-[#048CE7]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
        >
          {loading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
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
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
              Generating...
            </span>
          ) : (
            <span className="flex items-center">
              <svg
                className="h-5 w-5 mr-2 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 01-8 0m8 0V5a4 4 0 00-8 0v2m8 0a4 4 0 01-8 0m8 0v2a4 4 0 01-8 0V7"
                />
              </svg>
              Generate Content
            </span>
          )}
        </button>
        {error && (
          <div className="mt-4 text-red-400 bg-red-500/10 p-2 rounded text-center animate-shake">
            {error}
          </div>
        )}
      </div>
      {result && (
        <>
          <div className="flex items-center mb-2 mt-8">
            <div className="text-lg font-semibold text-[#90caf9] flex items-center">
              <span className="mr-2">✨</span>Generated Content
            </div>
            <button
              onClick={handleCopy}
              className={`ml-auto px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-200 border border-gray-600/50 bg-gray-700/50 text-gray-300 hover:text-[#90caf9] hover:border-[#90caf9] flex items-center ${
                copied
                  ? "bg-green-600/30 text-green-200 border-green-400/50"
                  : ""
              }`}
            >
              {copied ? (
                <>
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="bg-gray-900/80 border border-gray-700/50 rounded-xl p-6 text-gray-100 font-mono text-sm whitespace-pre-wrap shadow-lg animate-fade-in">
            {result}
          </div>
        </>
      )}
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
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}
