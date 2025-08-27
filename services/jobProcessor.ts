import AnalysisJob from "../models/AnalysisJob";
import { analyzeResumeWithGemini } from "./geminiService";
import { parsePdfToText, parseDocxToText } from "./fileParserService";
import dbConnect from "../lib/db";

export interface ProcessJobParams {
  jobId: string;
  fileBuffer: Buffer;
  fileType: string;
  extractionFields: any[];
  tags: any[];
}

export class JobProcessor {
  private static instance: JobProcessor;
  private processing = false;
  private jobQueue: ProcessJobParams[] = [];

  static getInstance(): JobProcessor {
    if (!JobProcessor.instance) {
      JobProcessor.instance = new JobProcessor();
    }
    return JobProcessor.instance;
  }

  // Add a new job to the queue
  addJob(jobParams: ProcessJobParams) {
    this.jobQueue.push(jobParams);
    console.log(
      `Added job ${jobParams.jobId} to queue. Queue length: ${this.jobQueue.length}`
    );

    // Start processing if not already running
    this.processQueuedJobs();
  }

  async processJob({
    jobId,
    fileBuffer,
    fileType,
    extractionFields,
    tags,
  }: ProcessJobParams) {
    await dbConnect();

    try {
      // Update status to processing
      await AnalysisJob.findOneAndUpdate(
        { jobId },
        {
          status: "processing",
          progress: 10,
          updatedAt: new Date(),
        }
      );

      console.log(`Starting processing for job ${jobId}`);

      // Step 1: Parse file (10-30% progress)
      let resumeText = "";

      if (fileType.includes("pdf")) {
        resumeText = await parsePdfToText(fileBuffer);
      } else if (fileType.includes("docx")) {
        resumeText = await parseDocxToText(fileBuffer);
      } else {
        throw new Error("Unsupported file type");
      }

      await AnalysisJob.findOneAndUpdate({ jobId }, { progress: 30 });

      if (!resumeText.trim()) {
        throw new Error("Could not extract text from the file");
      }

      console.log(`Extracted ${resumeText.length} characters for job ${jobId}`);

      // Step 2: AI Analysis (30-90% progress)
      await AnalysisJob.findOneAndUpdate({ jobId }, { progress: 50 });

      const result = await analyzeResumeWithGemini(
        resumeText,
        extractionFields,
        tags
      );

      await AnalysisJob.findOneAndUpdate({ jobId }, { progress: 90 });

      // Step 3: Save results (90-100% progress)
      const finalResult = {
        ...result,
        analyzedAt: new Date().toISOString(),
        processingTime: Date.now(),
      };

      await AnalysisJob.findOneAndUpdate(
        { jobId },
        {
          status: "completed",
          progress: 100,
          result: finalResult,
          completedAt: new Date(),
          updatedAt: new Date(),
        }
      );

      console.log(`Completed processing for job ${jobId}`);
      return finalResult;
    } catch (error: any) {
      console.error(`Error processing job ${jobId}:`, error);

      await AnalysisJob.findOneAndUpdate(
        { jobId },
        {
          status: "failed",
          error: error.message || "Processing failed",
          updatedAt: new Date(),
        }
      );

      throw error;
    }
  }

  // Process jobs in background
  async processQueuedJobs() {
    if (this.processing) return;

    this.processing = true;
    console.log("Starting job processor...");

    try {
      while (this.jobQueue.length > 0) {
        const jobParams = this.jobQueue.shift();
        if (jobParams) {
          console.log(`Processing job ${jobParams.jobId} from queue`);
          try {
            await this.processJob(jobParams);
            console.log(`Successfully processed job ${jobParams.jobId}`);
          } catch (error) {
            console.error(`Failed to process job ${jobParams.jobId}:`, error);
            // Job is already marked as failed in processJob method
          }
        }
      }
    } catch (error) {
      console.error("Error in job processor:", error);
    } finally {
      this.processing = false;
      console.log("Job processor finished");
    }
  }
}

export const jobProcessor = JobProcessor.getInstance();
