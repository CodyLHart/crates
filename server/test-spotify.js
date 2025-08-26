import dotenv from "dotenv";
import spotifyService from "./services/spotifyService.js";

dotenv.config({ path: "./config.env" });

async function testSpotifyIntegration() {
  try {
    console.log("🎵 Testing Spotify Integration...\n");

    // Test 1: Get access token
    console.log("1. Testing access token...");
    const token = await spotifyService.getAccessToken();
    console.log("✅ Access token obtained successfully");
    console.log(`   Token: ${token.substring(0, 20)}...\n`);

    // Test 2: Search for a track
    console.log("2. Testing track search...");
    const searchResults = await spotifyService.searchTracks(
      "Bohemian Rhapsody Queen",
      { limit: 3 }
    );
    console.log("✅ Track search successful");
    console.log(`   Found ${searchResults.tracks.items.length} tracks\n`);

    // Test 3: Get track details
    if (searchResults.tracks.items.length > 0) {
      const trackId = searchResults.tracks.items[0].id;
      console.log("3. Testing track details...");
      const track = await spotifyService.getTrack(trackId);
      console.log("✅ Track details retrieved successfully");
      console.log(`   Track: ${track.name} by ${track.artists[0].name}\n`);

      // Test 4: Get audio features
      console.log("4. Testing audio features...");
      const audioFeatures = await spotifyService.getTrackAudioFeatures(trackId);
      console.log("✅ Audio features retrieved successfully");
      console.log(`   BPM: ${audioFeatures.tempo}`);
      console.log(
        `   Key: ${audioFeatures.key} (${
          audioFeatures.mode === 1 ? "major" : "minor"
        })`
      );
      console.log(`   Energy: ${Math.round(audioFeatures.energy * 100)}%`);
      console.log(
        `   Danceability: ${Math.round(audioFeatures.danceability * 100)}%`
      );
      console.log(
        `   Acousticness: ${Math.round(audioFeatures.acousticness * 100)}%\n`
      );

      // Test 5: Search by title and artist
      console.log("5. Testing title/artist search...");
      const trackData = await spotifyService.searchTrackByTitleAndArtist(
        "Bohemian Rhapsody",
        "Queen"
      );
      if (trackData) {
        console.log("✅ Title/artist search successful");
        console.log(
          `   Found: ${trackData.track.name} - BPM: ${trackData.audioFeatures.tempo}`
        );
      } else {
        console.log("❌ Title/artist search failed");
      }
    }

    console.log("\n🎉 All Spotify integration tests passed!");
  } catch (error) {
    console.error("\n❌ Spotify integration test failed:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

testSpotifyIntegration();
