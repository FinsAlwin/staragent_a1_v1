"use client";

import { useState } from "react";
import AsyncResumeUpload from "@/components/resume/AsyncResumeUpload";

export default function AsyncUploadPage() {
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
                <h1 className="text-2xl font-bold text-white">
                  Async Resume Upload
                </h1>
                <p className="text-sm text-gray-300">
                  AI-powered resume analysis (No timeout issues)
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <a
                href="/upload"
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium"
              >
                Regular Upload
              </a>
              <a
                href="/dashboard"
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium"
              >
                Dashboard
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <div>
              <p className="text-sm text-green-200 font-medium">
                Async Processing - No More Timeout Issues!
              </p>
              <p className="text-xs text-green-300 mt-1">
                Your resume will be processed in the background. Perfect for
                large files and complex analysis.
              </p>
            </div>
          </div>
        </div>

        <AsyncResumeUpload />

        <div className="mt-8 text-center">
          <div className="bg-gray-800/60 rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-3">
              How It Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mb-2">
                  1
                </div>
                <p className="text-center">
                  Upload your resume and get a job ID instantly
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mb-2">
                  2
                </div>
                <p className="text-center">
                  Processing happens in the background (2-5 minutes)
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mb-2">
                  3
                </div>
                <p className="text-center">
                  View results when processing is complete
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
