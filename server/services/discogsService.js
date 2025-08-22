import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: "./config.env" });

class DiscogsService {
  constructor() {
    this.baseURL = "https://api.discogs.com";
    this.consumerKey = process.env.DISCOGS_CONSUMER_KEY;
    this.consumerSecret = process.env.DISCOGS_CONSUMER_SECRET;
    this.userAgent = process.env.DISCOGS_USER_AGENT || "CratesApp/1.0";

    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        "User-Agent": this.userAgent,
      },
    });
  }

  // Search for releases
  async searchReleases(query, options = {}) {
    try {
      const params = {
        q: query,
        type: "release",
        key: this.consumerKey,
        secret: this.consumerSecret,
        ...options,
      };

      const response = await this.api.get("/database/search", { params });
      return response.data;
    } catch (error) {
      console.error("Error searching releases:", error);
      throw error;
    }
  }

  // Get release details by ID
  async getRelease(releaseId) {
    try {
      const params = {
        key: this.consumerKey,
        secret: this.consumerSecret,
      };
      const response = await this.api.get(`/releases/${releaseId}`, { params });
      return response.data;
    } catch (error) {
      console.error("Error getting release:", error);
      throw error;
    }
  }

  // Get artist details by ID
  async getArtist(artistId) {
    try {
      const params = {
        key: this.consumerKey,
        secret: this.consumerSecret,
      };
      const response = await this.api.get(`/artists/${artistId}`, { params });
      return response.data;
    } catch (error) {
      console.error("Error getting artist:", error);
      throw error;
    }
  }

  // Get artist releases
  async getArtistReleases(artistId, options = {}) {
    try {
      const params = {
        key: this.consumerKey,
        secret: this.consumerSecret,
        ...options,
      };

      const response = await this.api.get(`/artists/${artistId}/releases`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error getting artist releases:", error);
      throw error;
    }
  }

  // Get master release details
  async getMaster(masterId) {
    try {
      const params = {
        key: this.consumerKey,
        secret: this.consumerSecret,
      };
      const response = await this.api.get(`/masters/${masterId}`, { params });
      return response.data;
    } catch (error) {
      console.error("Error getting master:", error);
      throw error;
    }
  }

  // Get label details
  async getLabel(labelId) {
    try {
      const params = {
        key: this.consumerKey,
        secret: this.consumerSecret,
      };
      const response = await this.api.get(`/labels/${labelId}`, { params });
      return response.data;
    } catch (error) {
      console.error("Error getting label:", error);
      throw error;
    }
  }

  // Get label releases
  async getLabelReleases(labelId, options = {}) {
    try {
      const params = {
        key: this.consumerKey,
        secret: this.consumerSecret,
        ...options,
      };

      const response = await this.api.get(`/labels/${labelId}/releases`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error getting label releases:", error);
      throw error;
    }
  }

  // Get marketplace listings for a release
  async getReleaseMarketplace(releaseId, options = {}) {
    try {
      const params = {
        key: this.consumerKey,
        secret: this.consumerSecret,
        ...options,
      };

      const response = await this.api.get(
        `/marketplace/listings/${releaseId}`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Error getting marketplace listings:", error);
      throw error;
    }
  }

  // Get database statistics
  async getDatabaseStats() {
    try {
      const params = {
        key: this.consumerKey,
        secret: this.consumerSecret,
      };
      const response = await this.api.get("/database/search", { params });
      return response.data;
    } catch (error) {
      console.error("Error getting database stats:", error);
      throw error;
    }
  }
}

export default new DiscogsService();
