import mongoose from "mongoose";

export interface IStoredImage extends mongoose.Document {
  name: string;
  description: string;
  imageUrl: string;
  s3Key?: string; // S3 object key for deletion
  uploadedAt: Date;
  uploadedBy: string;
  isActive: boolean;
}

const storedImageSchema = new mongoose.Schema<IStoredImage>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true,
  },
  s3Key: {
    type: String,
    trim: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  uploadedBy: {
    type: String,
    required: true,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

// Safely handle model initialization
let StoredImage: mongoose.Model<IStoredImage>;
try {
  StoredImage = mongoose.model<IStoredImage>("StoredImage");
} catch {
  StoredImage = mongoose.model<IStoredImage>("StoredImage", storedImageSchema);
}

export default StoredImage;
