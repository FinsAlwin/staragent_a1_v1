// Ensure pdfjsLib and mammoth are globally available from CDN scripts in _document.tsx
// These declarations help TypeScript understand that these variables exist globally.
declare const pdfjsLib: any;
declare const mammoth: any;

// Helper function to convert ArrayBuffer to string (for mammoth.js) - not actually used by mammoth.extractRawText
// const arrayBufferToString = (buffer: ArrayBuffer): string => {
//   return new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '');
// };

import { extractRawText } from "mammoth";
import * as pdfjs from "pdfjs-dist";
import { TextItem } from "pdfjs-dist/types/src/display/api";

// Initialize pdf.js worker for server-side
const pdfjsWorker = require("pdfjs-dist/build/pdf.worker.js");
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// Disable worker on server-side
const nodeCanvasFactory = {
  create: function (width: number, height: number) {
    return {
      width,
      height,
      canvas: null,
    };
  },
  reset: function (canvasAndContext: any, width: number, height: number) {
    canvasAndContext.width = width;
    canvasAndContext.height = height;
  },
  destroy: function (canvasAndContext: any) {
    // do nothing
  },
};
(pdfjs as any).CanvasFactory = nodeCanvasFactory;

export const parsePdfToText = async (
  file: File | Buffer | ArrayBuffer
): Promise<string> => {
  try {
    let data: Uint8Array;

    if (file instanceof ArrayBuffer) {
      data = new Uint8Array(file);
    } else if (Buffer.isBuffer(file)) {
      data = new Uint8Array(file);
    } else if (file instanceof File) {
      // Server-side: Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      data = new Uint8Array(arrayBuffer);
    } else {
      throw new Error("Invalid input type for PDF parsing");
    }

    // Load the PDF document using pdf.js
    const loadingTask = pdfjs.getDocument({
      data,
      useWorkerFetch: false, // Disable worker fetch on server-side
      isEvalSupported: false,
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    let textContent = "";

    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .filter((item): item is TextItem => "str" in item)
        .map((item) => item.str)
        .join(" ");
      textContent += pageText + "\n";
    }

    return textContent.trim();
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("Could not parse PDF content.");
  }
};

export const parseDocxToText = async (
  file: File | Buffer | ArrayBuffer
): Promise<string> => {
  try {
    let buffer: Buffer;

    if (Buffer.isBuffer(file)) {
      buffer = file;
    } else if (file instanceof ArrayBuffer) {
      buffer = Buffer.from(file);
    } else if (file instanceof File) {
      // Server-side: Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      throw new Error("Invalid input type for DOCX parsing");
    }

    const result = await extractRawText({ buffer });
    return result.value.trim();
  } catch (error) {
    console.error("Error parsing DOCX:", error);
    throw new Error(
      "Could not parse DOCX content. Ensure the file is a valid .docx file."
    );
  }
};
