// Performance test for optimized Gemini API
// Run with: node test-performance.js

const API_BASE = "http://localhost:3000";

async function testPerformance() {
  console.log("⚡ Testing Optimized Gemini API Performance...\n");

  const testData = {
    extractedText:
      'ALEXA RAY Fashion Model | Los Angeles, CA | alexaray@example.com | (555) 123-4567 PROFILE Professional and versatile fashion model with over 5 years of experience in runway, print, and commercial modeling. Featured in multiple high-end magazines and fashion campaigns. Highly adaptable with strong posing and communication skills. EXPERIENCE Runway Model | New York Fashion Week | New York, NY Jan 2023 - Sep 2024 - Walked for designers like Marc Jacobs, Vera Wang, and Calvin Klein. - Maintained posture, poise, and consistency under high-pressure environments. Commercial Model | Elite Models | Los Angeles, CA Jun 2020 - Dec 2022 - Featured in TV commercials for skincare and lifestyle brands. - Participated in photo and video shoots for product campaigns. EDUCATION Bachelor of Arts in Theatre and Performing Arts University of Southern California, Los Angeles, CA Graduated: 2019 MEASUREMENTS Height: 5\'10" | Weight: 125 lbs | Bust: 34" | Waist: 24" | Hips: 35" | Shoe Size: 8 | Eye Color: Green | Hair Color: Blonde SKILLS Runway Walking, Editorial Posing, Commercial Acting, Brand Representation, Collaboration with Designers and Photographers, Wardrobe Styling Basics.',
    extractionFields: [
      { key: "firstName", label: "First Name" },
      { key: "lastName", label: "Last Name" },
      { key: "email", label: "Email" },
      { key: "contactNumber", label: "Contact Number" },
      { key: "occupation", label: "Occupation" },
      { key: "address", label: "Address" },
    ],
    tags: [
      { name: "Model" },
      { name: "Fashion" },
      { name: "Runway Model" },
      { name: "Commercial Model" },
    ],
  };

  try {
    console.log("🚀 Starting performance test...");
    const startTime = Date.now();

    const response = await fetch(`${API_BASE}/api/extract-resume`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log(
      `⏱️  Response Time: ${responseTime}ms (${(responseTime / 1000).toFixed(
        2
      )}s)`
    );
    console.log(`📊 Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Analysis completed successfully!");
      console.log(
        `📝 Summary length: ${result.result.summary.length} characters`
      );
      console.log(`🏷️  Tags assigned: ${result.result.assignedTags.length}`);
      console.log(
        `📋 Fields extracted: ${
          Object.keys(result.result.extractedInformation).length
        }`
      );

      if (responseTime < 10000) {
        console.log("🎉 EXCELLENT: Response under 10 seconds!");
      } else if (responseTime < 20000) {
        console.log("👍 GOOD: Response under 20 seconds");
      } else if (responseTime < 30000) {
        console.log("⚠️  ACCEPTABLE: Response under 30 seconds");
      } else {
        console.log("🐌 SLOW: Response over 30 seconds");
      }
    } else {
      console.log("❌ Request failed");
      const error = await response.text();
      console.log("Error:", error);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the performance test
testPerformance();
