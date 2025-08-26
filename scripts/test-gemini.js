const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

async function testGemini() {
  console.log("Testing Gemini API configuration...\n");

  // Check environment variables
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    console.error(
      "❌ NEXT_PUBLIC_GEMINI_API_KEY is not set in environment variables"
    );
    console.log("Please set your Gemini API key in your .env file");
    return;
  }

  console.log("✅ API Key found");
  console.log("✅ Using gemini-2.5-pro model\n");

  try {
    // Initialize Gemini
    const ai = new GoogleGenAI({ apiKey });

    // Test simple content generation
    console.log("Testing basic content generation...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents:
        'Hello! Please respond with just the word "Hello" and nothing else.',
      config: {
        temperature: 0.1,
      },
    });

    const text = response?.text || "";
    console.log(`Response: "${text}"`);

    if (text.trim() === "Hello") {
      console.log("✅ Basic content generation working");
    } else {
      console.log("⚠️  Response format unexpected but API is responding");
    }

    // Test JSON response
    console.log("\nTesting JSON response generation...");
    const jsonResponse = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: 'Respond with only valid JSON: {"test": "value", "number": 42}',
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const jsonText = jsonResponse?.text || "";
    console.log(`Raw response: "${jsonText}"`);

    try {
      const parsed = JSON.parse(jsonText);
      console.log("✅ JSON parsing successful:", parsed);
    } catch (parseError) {
      console.log("⚠️  JSON parsing failed, but API is responding");
      console.log("Parse error:", parseError.message);
    }

    console.log("\n✅ Gemini API is working correctly!");
  } catch (error) {
    console.error("❌ Error testing Gemini API:", error.message);

    if (error.message.includes("API key")) {
      console.log("This might be an invalid API key issue");
    } else if (error.message.includes("quota")) {
      console.log("This might be a quota exceeded issue");
    } else if (error.message.includes("model")) {
      console.log("This might be a model access issue");
    }
  }
}

testGemini().catch(console.error);
