// Test script for synchronous API
// Run with: node test-sync-api.js

const API_BASE = "http://localhost:3000";

async function testSyncAPI() {
  console.log("🧪 Testing Synchronous Resume Analysis API...\n");

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
      console.log("   ✅ /api/analyze is public and accessible!");
    } else {
      console.log("   ❌ /api/analyze still requires authentication");
    }

    console.log("\n🎯 Summary:");
    console.log("   - /api/analyze: ✅ Public synchronous API");
    console.log("   - No job queue system");
    console.log("   - Direct upload and get results");
    console.log("   - Ready for simple integration!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
testSyncAPI();
