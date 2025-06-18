import dotenv from "dotenv";
import path from "path";
import connectDB from "../lib/db";
import User from "../models/User";
import Tag from "../models/Tag";
import ExtractionField from "../models/ExtractionField";

// Load environment variables
const envPath = path.resolve(process.cwd(), ".env.local");
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error("Error loading .env.local:", result.error);
  process.exit(1);
}

// Check if MongoDB URI is available
if (!process.env.NEXT_PUBLIC_MONGODB_URI) {
  console.error("NEXT_PUBLIC_MONGODB_URI is not set in environment variables");
  process.exit(1);
}

async function seedDatabase() {
  try {
    // Connect to database
    await connectDB();

    // Create admin user
    const adminUser = await User.findOne({ username: "admin" });
    if (!adminUser) {
      const newAdminUser = new User({
        username: "admin",
        password: "admin123", // In production, use hashed passwords
        role: "admin",
        isActive: true,
      });
      await newAdminUser.save();
    }

    // Seed extraction fields
    const extractionFields = [
      {
        key: "candidateName",
        label: "Candidate Name",
        description: "Full name of the candidate",
      },
      {
        key: "emailAddress",
        label: "Email Address",
        description: "Primary email contact",
      },
      {
        key: "phoneNumber",
        label: "Phone Number",
        description: "Primary phone contact",
      },
      {
        key: "location",
        label: "Location",
        description: "City, State, or Country",
      },
      {
        key: "summary",
        label: "Professional Summary",
        description: "Brief professional overview",
      },
      {
        key: "experience",
        label: "Work Experience",
        description: "Detailed work history",
      },
      {
        key: "education",
        label: "Education",
        description: "Academic background",
      },
      {
        key: "skills",
        label: "Skills",
        description: "Technical and soft skills",
      },
    ];

    for (const field of extractionFields) {
      await ExtractionField.findOneAndUpdate({ key: field.key }, field, {
        upsert: true,
        new: true,
      });
    }

    // Seed tags
    const tags = [
      "JavaScript",
      "React",
      "Node.js",
      "Python",
      "Java",
      "C++",
      "SQL",
      "MongoDB",
      "AWS",
      "Docker",
      "Kubernetes",
      "DevOps",
      "Machine Learning",
      "Data Science",
      "Project Management",
      "Agile",
      "Scrum",
      "UI/UX",
      "Graphic Design",
      "Marketing",
    ];

    for (const tagName of tags) {
      await Tag.findOneAndUpdate(
        { name: tagName },
        { name: tagName },
        { upsert: true, new: true }
      );
    }

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
