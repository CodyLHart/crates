import express from "express";
import spotifyService from "../services/spotifyService.js";

const router = express.Router();

// Spotify OAuth endpoints
router.get("/auth", (req, res) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
  const scope = "user-read-private user-read-email";

  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scope)}&show_dialog=true`;

  res.json({ authUrl });
});

router.get("/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Authorization code required" });
  }

  try {
    const tokenData = await spotifyService.exchangeCodeForTokens(code);
    res.json({
      message: "Authorization successful",
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
    });
  } catch (error) {
    console.error("Token exchange error:", error);
    res.status(500).json({ error: "Failed to exchange authorization code" });
  }
});

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token required" });
  }

  try {
    const tokenData = await spotifyService.refreshAccessToken(refreshToken);
    res.json({
      accessToken: tokenData.access_token,
      expiresIn: tokenData.expires_in,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({ error: "Failed to refresh token" });
  }
});

// Search for tracks
router.get("/search", async (req, res) => {
  try {
    const { q, limit = 20, offset = 0 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const results = await spotifyService.searchTracks(q, { limit, offset });
    res.json(results);
  } catch (error) {
    console.error("Spotify search error:", error);
    res.status(500).json({ error: "Failed to search Spotify" });
  }
});

// Get track details by ID
router.get("/track/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const track = await spotifyService.getTrack(id);
    res.json(track);
  } catch (error) {
    console.error("Get Spotify track error:", error);
    res.status(500).json({ error: "Failed to get track details" });
  }
});

// Get track audio features by ID
router.get("/track/:id/audio-features", async (req, res) => {
  try {
    const { id } = req.params;
    const audioFeatures = await spotifyService.getTrackAudioFeatures(id);
    res.json(audioFeatures);
  } catch (error) {
    console.error("Get Spotify audio features error:", error);
    res.status(500).json({ error: "Failed to get audio features" });
  }
});

// Get comprehensive track data with features
router.get("/track/:id/with-features", async (req, res) => {
  try {
    const { id } = req.params;
    const trackData = await spotifyService.getTrackWithFeatures(id);
    res.json(trackData);
  } catch (error) {
    console.error("Get Spotify track with features error:", error);
    res.status(500).json({ error: "Failed to get track with features" });
  }
});

// Search for a specific track by title and artist
router.get("/search-track", async (req, res) => {
  try {
    const { title, artist } = req.query;

    if (!title || !artist) {
      return res.status(400).json({
        error: 'Both "title" and "artist" parameters are required',
      });
    }

    console.log(`Searching Spotify for: "${title}" by "${artist}"`);

    const result = await spotifyService.searchTrackByTitleAndArtist(
      title,
      artist
    );

    console.log("Search result:", result);

    if (result && result.track) {
      // Success - return the result even if audio features aren't available
      res.json(result);
    } else {
      res.status(404).json({ error: "Track not found" });
    }
  } catch (error) {
    console.error("Spotify track search error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      error: "Failed to search for track",
      details: error.message,
    });
  }
});

// Search for track with audio features using user authorization
router.post("/search-track-with-features", async (req, res) => {
  try {
    const { title, artist, userAccessToken } = req.body;

    if (!title || !artist || !userAccessToken) {
      return res.status(400).json({
        error: "Title, artist, and userAccessToken are required",
      });
    }

    console.log(
      `Searching Spotify with user auth for: "${title}" by "${artist}"`
    );

    const result = await spotifyService.searchTrackWithAudioFeatures(
      title,
      artist,
      userAccessToken
    );

    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: "Track not found" });
    }
  } catch (error) {
    console.error("Spotify track search with features error:", error);
    res.status(500).json({
      error: "Failed to search for track with features",
      details: error.message,
    });
  }
});

// Get multiple tracks' audio features
router.get("/tracks/audio-features", async (req, res) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return res
        .status(400)
        .json({ error: 'Query parameter "ids" is required' });
    }

    const trackIds = ids.split(",");

    if (trackIds.length > 100) {
      return res.status(400).json({ error: "Maximum 100 track IDs allowed" });
    }

    const audioFeatures = await spotifyService.getMultipleTracksAudioFeatures(
      trackIds
    );
    res.json(audioFeatures);
  } catch (error) {
    console.error("Get multiple tracks audio features error:", error);
    res.status(500).json({ error: "Failed to get audio features" });
  }
});

// Health check endpoint
router.get("/health", async (req, res) => {
  try {
    // Try to get an access token to verify the service is working
    await spotifyService.getAccessToken();
    res.json({ status: "healthy", message: "Spotify service is working" });
  } catch (error) {
    res.status(500).json({ status: "unhealthy", error: error.message });
  }
});

// Debug endpoint to test the service directly
router.get("/debug", async (req, res) => {
  try {
    console.log("Testing Spotify service directly...");

    // Test basic search
    const searchResult = await spotifyService.searchTracks("test", {
      limit: 1,
    });
    console.log("Basic search result:", searchResult ? "Success" : "Failed");

    // Test the problematic method
    const trackResult = await spotifyService.searchTrackByTitleAndArtist(
      "Bohemian Rhapsody",
      "Queen"
    );
    console.log("Track search result:", trackResult ? "Success" : "Failed");

    res.json({
      status: "debug",
      basicSearch: searchResult ? "Success" : "Failed",
      trackSearch: trackResult ? "Success" : "Failed",
      trackData: trackResult,
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    res.status(500).json({
      status: "debug failed",
      error: error.message,
      stack: error.stack,
    });
  }
});

export default router;
