import express from "express";
import discogsService from "../services/discogsService.js";

const router = express.Router();

// Search for releases
router.get("/search", async (req, res) => {
  try {
    const {
      q,
      type = "release",
      page = 1,
      per_page = 20,
      ...otherParams
    } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const options = {
      type,
      page,
      per_page,
      ...otherParams,
    };

    const results = await discogsService.searchReleases(q, options);
    res.json(results);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Failed to search Discogs" });
  }
});

// Get release details by ID
router.get("/releases/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const release = await discogsService.getRelease(id);
    res.json(release);
  } catch (error) {
    console.error("Get release error:", error);
    res.status(500).json({ error: "Failed to get release details" });
  }
});

// Get artist details by ID
router.get("/artists/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const artist = await discogsService.getArtist(id);
    res.json(artist);
  } catch (error) {
    console.error("Get artist error:", error);
    res.status(500).json({ error: "Failed to get artist details" });
  }
});

// Get artist releases
router.get("/artists/:id/releases", async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, per_page = 20, ...otherParams } = req.query;

    const options = {
      page,
      per_page,
      ...otherParams,
    };

    const releases = await discogsService.getArtistReleases(id, options);
    res.json(releases);
  } catch (error) {
    console.error("Get artist releases error:", error);
    res.status(500).json({ error: "Failed to get artist releases" });
  }
});

// Get master release details
router.get("/masters/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const master = await discogsService.getMaster(id);
    res.json(master);
  } catch (error) {
    console.error("Get master error:", error);
    res.status(500).json({ error: "Failed to get master release details" });
  }
});

// Get label details
router.get("/labels/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const label = await discogsService.getLabel(id);
    res.json(label);
  } catch (error) {
    console.error("Get label error:", error);
    res.status(500).json({ error: "Failed to get label details" });
  }
});

// Get label releases
router.get("/labels/:id/releases", async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, per_page = 20, ...otherParams } = req.query;

    const options = {
      page,
      per_page,
      ...otherParams,
    };

    const releases = await discogsService.getLabelReleases(id, options);
    res.json(releases);
  } catch (error) {
    console.error("Get label releases error:", error);
    res.status(500).json({ error: "Failed to get label releases" });
  }
});

// Get marketplace listings for a release
router.get("/marketplace/:releaseId", async (req, res) => {
  try {
    const { releaseId } = req.params;
    const { page = 1, per_page = 20, ...otherParams } = req.query;

    const options = {
      page,
      per_page,
      ...otherParams,
    };

    const listings = await discogsService.getReleaseMarketplace(
      releaseId,
      options
    );
    res.json(listings);
  } catch (error) {
    console.error("Get marketplace error:", error);
    res.status(500).json({ error: "Failed to get marketplace listings" });
  }
});

// Health check endpoint
router.get("/health", async (req, res) => {
  try {
    // Test the API connection with a simple search
    await discogsService.searchReleases("test", { per_page: 1 });
    res.json({
      status: "healthy",
      message: "Discogs API connection successful",
    });
  } catch (error) {
    console.error("Health check error:", error);
    res
      .status(500)
      .json({ status: "unhealthy", error: "Discogs API connection failed" });
  }
});

export default router;
