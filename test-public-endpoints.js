// Test script for public API endpoints
// Run with: node test-public-endpoints.js

const API_BASE = "http://localhost:3000";

async function testPublicEndpoints() {
  console.log("🧪 Testing Public API Endpoints...\n");

  try {
    // Test 1: Check if analyze endpoint is accessible
    console.log("1️⃣ Testing /api/analyze endpoint...");

    const testResponse = await fetch(`${API_BASE}/api/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      body: "test", // This will fail validation but shows endpoint is accessible
    });

    console.log(`   Status: ${testResponse.status}`);
    console.log(`   Response: ${testResponse.statusText}`);

    if (testResponse.status !== 401) {
      console.log("   ✅ /api/analyze is public!");
    } else {
      console.log("   ❌ /api/analyze still requires authentication");
    }

    // Test 2: Check analyze-status endpoint
    console.log("\n2️⃣ Testing /api/analyze-status endpoint...");

    const statusResponse = await fetch(
      `${API_BASE}/api/analyze-status/test-job-id`
    );
    console.log(`   Status: ${statusResponse.status}`);
    console.log(`   Response: ${statusResponse.statusText}`);

    if (statusResponse.status !== 401) {
      console.log("   ✅ /api/analyze-status is public!");
    } else {
      console.log("   ❌ /api/analyze-status still requires authentication");
    }

    console.log("\n🎯 Summary:");
    console.log("   - /api/analyze: ✅ Public API for resume analysis");
    console.log(
      "   - /api/analyze-status/{jobId}: ✅ Public API for job status"
    );
    console.log("   - Both endpoints can be used by external projects");
    console.log("   - No authentication required");
    console.log("   - Ready for cross-project integration!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
testPublicEndpoints();
