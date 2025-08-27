import mongoose from "mongoose";

export interface IAnalysisJob extends mongoose.Document {
  jobId: string;
  userId?: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  result?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  extractionFields: any[];
  tags: any[];
}

const AnalysisJobSchema = new mongoose.Schema<IAnalysisJob>(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["queued", "processing", "completed", "failed"],
      default: "queued",
      index: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
    },
    error: {
      type: String,
    },
    extractionFields: [
      {
        type: mongoose.Schema.Types.Mixed,
      },
    ],
    tags: [
      {
        type: mongoose.Schema.Types.Mixed,
      },
    ],
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Clean up old jobs (optional)
AnalysisJobSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 * 7 }); // 7 days

export default mongoose.models.AnalysisJob ||
  mongoose.model<IAnalysisJob>("AnalysisJob", AnalysisJobSchema);
