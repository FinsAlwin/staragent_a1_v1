require("dotenv").config();
const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define User Schema
const UserSchema = new Schema({
  username: String,
  email: String,
  password: String,
  role: String,
  token: String,
  tokenExpiry: Date,
});

const User = mongoose.model("User", UserSchema);

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODQ5NjBjM2JlZGJkNmRjYjhiNDRhMTIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImV4cCI6MTc1MjIzNjE0NSwiaWF0IjoxNzQ5NjQ0MTQ1fQ.0rZG3AlpYZghX-CQGDhNZO99tYqmfaXAQjolKFrtelI";
const userId = "684960c3bedbd6dcb8b44a12";

async function updateUserToken() {
  try {
    await mongoose.connect(process.env.NEXT_PUBLIC_MONGODB_URI);
    console.log("Connected to MongoDB");

    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found");
      return;
    }

    user.token = token;
    user.tokenExpiry = new Date("2025-07-11"); // Match the exp in the JWT
    await user.save();

    console.log("User token updated successfully:", {
      id: user._id,
      email: user.email,
      token: user.token,
      tokenExpiry: user.tokenExpiry,
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

updateUserToken();
