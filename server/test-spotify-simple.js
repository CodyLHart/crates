import dotenv from "dotenv";
import spotifyService from "./services/spotifyService.js";

dotenv.config({ path: "./config.env" });

async function testSimpleSearch() {
  try {
    console.log("🔍 Testing simple track search...\n");

    console.log("1. Testing access token...");
    const token = await spotifyService.getAccessToken();
    console.log("✅ Access token obtained successfully");

    console.log("\n2. Testing track search...");
    const result = await spotifyService.searchTrackByTitleAndArtist(
      "Bohemian Rhapsody",
      "Queen"
    );

    if (result) {
      console.log("✅ Search successful!");
      console.log("Track:", result.track.name);
      console.log("Artist:", result.track.artists[0].name);
      console.log(
        "Audio Features:",
        result.audioFeatures ? "Available" : "Not available"
      );
      console.log("Message:", result.message || "None");
    } else {
      console.log("❌ No results found");
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Stack:", error.stack);
  }
}

testSimpleSearch();
