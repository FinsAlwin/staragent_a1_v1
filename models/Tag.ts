import mongoose from "mongoose";

const tagSchema = new mongoose.Schema(
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
    color: {
      type: String,
      required: false,
      default: "#3B82F6", // Default blue color
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Tag || mongoose.model("Tag", tagSchema);
