import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: "./config.env" });

class SpotifyService {
  constructor() {
    this.baseURL = "https://api.spotify.com/v1";
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.redirectUri = process.env.SPOTIFY_REDIRECT_URI;

    // Client credentials flow (for basic operations)
    this.clientAccessToken = null;
    this.clientTokenExpiry = null;
  }

  // Client Credentials Flow (for basic operations)
  async getClientAccessToken() {
    if (this.clientAccessToken && this.clientTokenExpiry > Date.now()) {
      return this.clientAccessToken;
    }

    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${this.clientId}:${this.clientSecret}`
          ).toString("base64")}`,
        },
        body: "grant_type=client_credentials",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to get client access token: ${response.statusText}`
        );
      }

      const data = await response.json();
      this.clientAccessToken = data.access_token;
      this.clientTokenExpiry = Date.now() + data.expires_in * 1000;

      return this.clientAccessToken;
    } catch (error) {
      console.error("Error getting client access token:", error);
      throw error;
    }
  }

  // OAuth Flow (for user-specific operations with audio features)
  async exchangeCodeForTokens(code) {
    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${this.clientId}:${this.clientSecret}`
          ).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: this.redirectUri,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to exchange code for tokens: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error exchanging code for tokens:", error);
      throw error;
    }
  }

  async refreshAccessToken(refreshToken) {
    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${this.clientId}:${this.clientSecret}`
          ).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to refresh access token: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error refreshing access token:", error);
      throw error;
    }
  }

  // Get track audio features with user token (includes BPM, key, energy, etc.)
  async getTrackAudioFeaturesWithUserToken(trackId, userAccessToken) {
    try {
      const response = await fetch(
        `${this.baseURL}/audio-features/${trackId}`,
        {
          headers: {
            Authorization: `Bearer ${userAccessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get audio features: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(
        "Error getting track audio features with user token:",
        error
      );
      throw error;
    }
  }

  // Search for track and get audio features with user token
  async searchTrackWithAudioFeatures(title, artist, userAccessToken) {
    try {
      // First search for the track
      const query = `${title} artist:${artist}`;
      const searchResponse = await fetch(
        `${this.baseURL}/search?q=${encodeURIComponent(
          query
        )}&type=track&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${userAccessToken}`,
          },
        }
      );

      if (!searchResponse.ok) {
        throw new Error(`Track search failed: ${searchResponse.statusText}`);
      }

      const searchData = await searchResponse.json();

      if (!searchData.tracks || searchData.tracks.items.length === 0) {
        return null;
      }

      // Get the first (most relevant) result
      const track = searchData.tracks.items[0];

      // Get audio features for this track
      const audioFeatures = await this.getTrackAudioFeaturesWithUserToken(
        track.id,
        userAccessToken
      );

      return {
        track,
        audioFeatures,
        message: "Full audio features available with user authorization",
      };
    } catch (error) {
      console.error("Error searching track with audio features:", error);
      throw error;
    }
  }

  // Legacy methods for compatibility (using client credentials)
  async getAccessToken() {
    return this.getClientAccessToken();
  }

  async searchTracks(query, options = {}) {
    try {
      const token = await this.getClientAccessToken();
      const params = new URLSearchParams({
        q: query,
        type: "track",
        limit: (options.limit || 20).toString(),
        offset: (options.offset || 0).toString(),
        market: "US",
        ...options,
      });

      const response = await fetch(`${this.baseURL}/search?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error searching Spotify tracks:", error);
      throw error;
    }
  }

  async searchTrackByTitleAndArtist(title, artist) {
    try {
      const query = `${title} artist:${artist}`;
      const searchResult = await this.searchTracks(query, { limit: 5 });

      if (searchResult.tracks && searchResult.tracks.items.length > 0) {
        const track = searchResult.tracks.items[0];

        return {
          track,
          audioFeatures: null, // Will be null due to authorization requirements
          message: "Audio features require user login to Spotify",
        };
      }

      return null;
    } catch (error) {
      console.error("Error searching track by title and artist:", error);
      throw error;
    }
  }

  async getTrack(trackId) {
    try {
      const token = await this.getClientAccessToken();
      const response = await fetch(`${this.baseURL}/tracks/${trackId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get track: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting Spotify track:", error);
      throw error;
    }
  }

  async getTrackAudioFeatures(trackId) {
    try {
      const token = await this.getClientAccessToken();
      const response = await fetch(
        `${this.baseURL}/audio-features/${trackId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get audio features: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting Spotify audio features:", error);
      throw error;
    }
  }

  async getMultipleTracksAudioFeatures(trackIds) {
    try {
      const token = await this.getClientAccessToken();
      const ids = trackIds.join(",");

      const response = await fetch(
        `${this.baseURL}/audio-features?ids=${ids}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get audio features: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting multiple tracks audio features:", error);
      throw error;
    }
  }

  async getTrackWithFeatures(trackId) {
    try {
      const [track, audioFeatures] = await Promise.all([
        this.getTrack(trackId),
        this.getTrackAudioFeatures(trackId),
      ]);

      return {
        track,
        audioFeatures,
      };
    } catch (error) {
      console.error("Error getting track with features:", error);
      throw error;
    }
  }
}

export default new SpotifyService();
