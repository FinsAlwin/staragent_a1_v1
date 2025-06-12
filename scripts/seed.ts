import { config } from "dotenv";
import { resolve } from "path";

const envPath = resolve(process.cwd(), ".env.local");
console.log("Loading .env.local from:", envPath);

const result = config({ path: envPath });
console.log("Dotenv config result:", result);
console.log("MONGODB_URI:", process.env.MONGODB_URI);

import dbConnect from "../lib/db";
import User from "../models/User";
import ExtractionField from "../models/ExtractionField";
import Tag from "../models/Tag";

// Define constants directly in the script - matching the database schema
const DEFAULT_EXTRACTION_FIELDS = [
  {
    name: "Candidate Name",
    description: "Full name of the candidate",
    type: "text",
    required: true,
  },
  {
    name: "Email Address",
    description: "Primary email address",
    type: "text",
    required: true,
  },
  {
    name: "Phone Number",
    description: "Primary contact number",
    type: "text",
    required: false,
  },
  {
    name: "Years of Experience",
    description: "Total years of professional experience",
    type: "number",
    required: false,
  },
  {
    name: "Education",
    description: "Highest level of education and major field of study",
    type: "text",
    required: false,
  },
];

const DEFAULT_TAGS = [
  { name: "JavaScript" },
  { name: "Python" },
  { name: "Java" },
  { name: "React" },
  { name: "Node.js" },
  { name: "SQL" },
  { name: "Machine Learning" },
  { name: "DevOps" },
  { name: "Fashion Modeling" },
  { name: "Runway" },
  { name: "Commercial Modeling" },
  { name: "Photography" },
  { name: "Brand Representation" },
  { name: "Communication" },
  { name: "Project Management" },
];

const ADMIN_USER = {
  username: "admin",
  email: "admin@example.com",
  password: "admin123", // Change this in production!
  role: "admin",
};

async function seed() {
  try {
    // Connect to database
    await dbConnect();

    // Create admin user if doesn't exist
    const existingAdmin = await User.findOne({ email: ADMIN_USER.email });
    let adminUser;

    if (!existingAdmin) {
      console.log("Creating admin user...");
      adminUser = await User.create(ADMIN_USER);
      console.log("Admin user created successfully");
    } else {
      console.log("Admin user already exists");
      adminUser = existingAdmin;
    }

    // Seed extraction fields
    console.log("Seeding extraction fields...");
    for (const field of DEFAULT_EXTRACTION_FIELDS) {
      await ExtractionField.findOneAndUpdate(
        { name: field.name },
        { ...field, createdBy: adminUser._id },
        { upsert: true, new: true }
      );
    }
    console.log("Extraction fields seeded successfully");

    // Seed tags
    console.log("Seeding tags...");
    for (const tag of DEFAULT_TAGS) {
      await Tag.findOneAndUpdate(
        { name: tag.name },
        { ...tag, createdBy: adminUser._id },
        { upsert: true, new: true }
      );
    }
    console.log("Tags seeded successfully");

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
