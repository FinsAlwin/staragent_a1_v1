import React, { useState, useCallback } from 'react';
import { parsePdfToText, parseDocxToText } from '@/services/fileParserService'; // Updated import path
import { analyzeResumeWithGemini } from '@/services/geminiService'; // Updated import path
import { useAppContext } from '@/context/AppContext'; // Updated import path
import { type ResumeAnalysisResult } from '../../types'; // Updated import path
import LoadingSpinner from '@/components/common/LoadingSpinner'; // Updated import path

const ResumeUploadForm: React.FC = () => {
  const { state } = useAppContext();
  const { extractionFields, tags: availableTags } = state;
  
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [showRawJson, setShowRawJson] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === "application/pdf" || selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        setFile(selectedFile);
        setFileName(selectedFile.name);
        setError(null);
        setAnalysisResult(null); 
      } else {
        setError("Invalid file type. Please upload a PDF or DOCX file.");
        setFile(null);
        setFileName('');
        event.target.value = ''; // Reset file input
      }
    }
  };

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError("Please select a file to analyze.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      let resumeText = '';
      if (file.type === "application/pdf") {
        resumeText = await parsePdfToText(file);
      } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        resumeText = await parseDocxToText(file);
      } else {
        throw new Error("Unsupported file type provided to parser.");
      }
      
      if (!resumeText.trim()) {
        throw new Error("Extracted text from resume is empty. The document might be image-based, corrupted, or the parser failed.");
      }

      // Ensure fields and tags are loaded before calling API
      if (!extractionFields || extractionFields.length === 0 || !availableTags || availableTags.length === 0) {
         throw new Error("Extraction fields or available tags are not loaded. Please ensure admin settings are configured.");
      }

      const result = await analyzeResumeWithGemini(resumeText, extractionFields, availableTags);
      setAnalysisResult(result);
    } catch (err: any) {
      console.error("Analysis error:", err);
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setIsLoading(false);
    }
  }, [file, extractionFields, availableTags]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:p-8">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">Upload Resume for Analysis</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="resume-upload-input" className="block text-sm font-medium text-gray-700 mb-2">
                Resume File (PDF or DOCX)
              </label>
              <div className="mt-1 flex justify-center px-4 md:px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="space-y-2 text-center">
                  <svg className="mx-auto h-10 w-10 md:h-12 md:w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex flex-col md:flex-row items-center justify-center text-sm text-gray-600">
                    <label
                      htmlFor="resume-upload-input"
                      className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input id="resume-upload-input" name="resume-upload-input" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.docx" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF or DOCX up to 10MB</p>
                  {fileName && <p className="text-sm text-green-600 mt-2 break-all">{fileName}</p>}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !file}
              className="w-full flex justify-center py-2 md:py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Resume'}
            </button>
          </form>
        </div>

        {isLoading && (
          <div className="p-6 flex justify-center">
            <LoadingSpinner />
          </div>
        )}
        
        {error && (
          <div role="alert" className="m-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {analysisResult && (
          <div className="border-t border-gray-200">
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  {showRawJson ? 'Show Formatted View' : 'Show Raw JSON'}
                </button>
              </div>

              {showRawJson ? (
                <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                  {JSON.stringify(analysisResult, null, 2)}
                </pre>
              ) : (
                <div className="space-y-8">
                  <div>
                    <h4 className="text-lg md:text-xl font-medium text-gray-800 mb-3">Summary</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm md:text-base">{analysisResult.summary}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg md:text-xl font-medium text-gray-800 mb-3">Extracted Information</h4>
                    {Object.keys(analysisResult.extractedInformation).length > 0 ? (
                      <div className="bg-gray-50 rounded-lg divide-y divide-gray-200">
                        {Object.entries(analysisResult.extractedInformation).map(([key, value]) => {
                          const fieldLabel = extractionFields.find(f => f.key === key)?.label || key;
                          return (
                            <div key={key} className="p-4 flex flex-col md:flex-row md:items-start">
                              <div className="font-medium text-gray-700 mb-1 md:mb-0 md:w-1/3">{fieldLabel}:</div>
                              <div className="text-gray-600 md:w-2/3">{value}</div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No information extracted based on current fields.</p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-lg md:text-xl font-medium text-gray-800 mb-3">Assigned Tags</h4>
                    {analysisResult.assignedTags.length > 0 ? (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.assignedTags.map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No relevant tags assigned.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUploadForm;
