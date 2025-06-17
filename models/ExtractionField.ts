import mongoose from "mongoose";

const extractionFieldSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["text", "number", "date", "boolean", "array"],
    },
    required: {
      type: Boolean,
      default: false,
    },
    defaultValue: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    validation: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ExtractionField ||
  mongoose.model("ExtractionField", extractionFieldSchema);
