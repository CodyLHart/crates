import dotenv from "dotenv";
import discogsService from "./services/discogsService.js";

dotenv.config({ path: "./config.env" });

async function testDiscogsAPI() {
  console.log("Testing Discogs API integration...\n");

  try {
    // Test 1: Search for releases
    console.log("1. Testing search functionality...");
    const searchResults = await discogsService.searchReleases(
      "Dark Side of the Moon",
      { per_page: 3 }
    );
    console.log(`Found ${searchResults.results?.length || 0} results`);
    if (searchResults.results && searchResults.results.length > 0) {
      console.log(
        `First result: ${searchResults.results[0].title} by ${searchResults.results[0].artist}`
      );
    }
    console.log("✅ Search test passed\n");

    // Test 2: Get release details (if we have results)
    if (searchResults.results && searchResults.results.length > 0) {
      const releaseId = searchResults.results[0].id;
      console.log(`2. Testing get release details for ID: ${releaseId}...`);
      const releaseDetails = await discogsService.getRelease(releaseId);
      console.log(`Release title: ${releaseDetails.title}`);
      console.log(`Artist: ${releaseDetails.artists?.[0]?.name || "Unknown"}`);
      console.log("✅ Get release test passed\n");
    }

    // Test 3: Get artist details (Pink Floyd as example)
    console.log("3. Testing get artist details...");
    const artistDetails = await discogsService.getArtist(83); // Pink Floyd's ID
    console.log(`Artist name: ${artistDetails.name}`);
    console.log(`Profile: ${artistDetails.profile?.substring(0, 100)}...`);
    console.log("✅ Get artist test passed\n");

    console.log(
      "🎉 All tests passed! Discogs API integration is working correctly."
    );
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

// Run the test
testDiscogsAPI();
