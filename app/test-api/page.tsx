'use client';

import React, { useState } from 'react';

export default function TestAPI() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze resume');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Test Resume Analysis API</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="resume" className="block text-sm font-medium text-gray-700">
                  Upload Resume (PDF or DOCX)
                </label>
                <div className="mt-1">
                  <input
                    type="file"
                    id="resume"
                    accept=".pdf,.docx"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!file || isLoading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Analyzing...' : 'Analyze Resume'}
              </button>
            </form>

            {error && (
              <div className="mt-6 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <p className="mt-2 text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {result && (
              <div className="mt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Analysis Result</h2>
                <div className="bg-gray-50 rounded-md p-4">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Summary</h3>
                      <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{result.summary}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Extracted Information</h3>
                      <dl className="mt-2 divide-y divide-gray-200">
                        {Object.entries(result.extractedInformation).map(([key, value]) => (
                          <div key={key} className="py-3 flex justify-between text-sm">
                            <dt className="text-gray-500">{key}</dt>
                            <dd className="text-gray-900 ml-6">{value as string}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Assigned Tags</h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {result.assignedTags.map((tag: string) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">API Documentation</h2>
            <div className="prose prose-sm">
              <h3>cURL Example</h3>
              <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto">
{`curl -X POST \\
  -F "resume=@path/to/resume.pdf" \\
  http://localhost:3000/api/analyze`}
              </pre>

              <h3 className="mt-4">JavaScript Example</h3>
              <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto">
{`const formData = new FormData();
formData.append('resume', file);

const response = await fetch('/api/analyze', {
  method: 'POST',
  body: formData
});

const result = await response.json();`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 