import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSpotifyAuth } from "../hooks/useSpotifyAuth";

interface Track {
  position: string;
  title: string;
  duration: string;
  artists?: string[];
  spotifyId?: string;
  bpm?: number;
  key?: number;
  mode?: string;
  energy?: number;
  danceability?: number;
  acousticness?: number;
  instrumentalness?: number;
  valence?: number;
  tempo?: number;
}

interface Album {
  _id?: string;
  title: string;
  artist: string;
  year?: string;
  thumb?: string;
  discogsId: number;
  addedAt: string;
  genre?: string[];
  style?: string[];
  country?: string;
  format?: string[];
  label?: string;
  catno?: string;
  barcode?: string;
  tracks?: Track[];
  notes?: string;
  masterId?: number;
  status?: string;
}

interface SpotifyEnhancerProps {
  album: Album;
  onEnhance: (enhancedAlbum: Album) => void;
  onClose: () => void;
}

const SpotifyEnhancer: React.FC<SpotifyEnhancerProps> = ({
  album,
  onEnhance,
  onClose,
}) => {
  const { token } = useAuth();
  const {
    isAuthenticated: isSpotifyAuthenticated,
    login: spotifyLogin,
    tokens: spotifyTokens,
  } = useSpotifyAuth();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [enhancedTracks, setEnhancedTracks] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);

  const enhanceAlbumWithSpotify = async () => {
    if (!album.tracks || album.tracks.length === 0) {
      setError("No tracks found to enhance");
      return;
    }

    if (!isSpotifyAuthenticated || !spotifyTokens) {
      setError("Please log into Spotify first to get audio features");
      return;
    }

    setLoading(true);
    setProgress(0);
    setError(null);
    setEnhancedTracks([]);

    try {
      const enhancedTracks: Track[] = [];

      for (let i = 0; i < album.tracks.length; i++) {
        const track = album.tracks[i];
        setProgress(((i + 1) / album.tracks.length) * 100);

        try {
          // Use the new endpoint with user authorization for audio features
          const response = await fetch(
            `http://localhost:5050/api/spotify/search-track-with-features`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                title: track.title,
                artist: album.artist,
                userAccessToken: spotifyTokens.accessToken,
              }),
            }
          );

          if (response.ok) {
            const spotifyData = await response.json();

            if (spotifyData.audioFeatures) {
              // Enhance track with full Spotify audio features
              const enhancedTrack: Track = {
                ...track,
                spotifyId: spotifyData.track.id,
                bpm: spotifyData.audioFeatures.tempo,
                key: spotifyData.audioFeatures.key,
                mode: spotifyData.audioFeatures.mode === 1 ? "major" : "minor",
                energy: spotifyData.audioFeatures.energy,
                danceability: spotifyData.audioFeatures.danceability,
                acousticness: spotifyData.audioFeatures.acousticness,
                instrumentalness: spotifyData.audioFeatures.instrumentalness,
                valence: spotifyData.audioFeatures.valence,
                tempo: spotifyData.audioFeatures.tempo,
              };
              enhancedTracks.push(enhancedTrack);
            } else {
              // Fallback to basic track info
              const basicTrack: Track = {
                ...track,
                spotifyId: spotifyData.track.id,
              };
              enhancedTracks.push(basicTrack);
            }
          } else {
            // If Spotify search fails, keep original track
            enhancedTracks.push(track);
          }
        } catch (err) {
          console.error(`Failed to enhance track ${track.title}:`, err);
          // Keep original track if enhancement fails
          enhancedTracks.push(track);
        }

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      setEnhancedTracks(enhancedTracks);

      // Create enhanced album
      const enhancedAlbum: Album = {
        ...album,
        tracks: enhancedTracks,
      };

      onEnhance(enhancedAlbum);
    } catch (err) {
      setError("Failed to enhance album with Spotify data");
      console.error("Enhancement error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getKeyName = (key: number, mode: number) => {
    const keys = [
      "C",
      "C♯",
      "D",
      "D♯",
      "E",
      "F",
      "F♯",
      "G",
      "G♯",
      "A",
      "A♯",
      "B",
    ];
    const modes = ["minor", "major"];
    return `${keys[key]} ${modes[mode]}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Enhance Album with Spotify Data
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            This will enhance <strong>{album.title}</strong> by {album.artist}{" "}
            with:
          </p>

          {isSpotifyAuthenticated ? (
            <>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• BPM (tempo) for each track</li>
                <li>• Musical key and mode</li>
                <li>• Energy, danceability, and acousticness levels</li>
                <li>• Instrumental and valence scores</li>
                <li className="text-green-600 font-medium">
                  ✅ Full audio features available
                </li>
              </ul>

              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Ready!</strong> You're logged into Spotify and can
                  access all audio features including BPM.
                </p>
              </div>
            </>
          ) : (
            <>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Basic track information from Spotify</li>
                <li>• Track IDs for direct Spotify links</li>
                <li className="text-amber-600 font-medium">
                  ⚠️ Audio features (BPM, key, energy) require Spotify login
                </li>
              </ul>

              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Login Required:</strong> To get BPM, key, energy, and
                  other audio features, you need to log into your Spotify
                  account.
                </p>
                <button
                  onClick={spotifyLogin}
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  🎵 Login to Spotify
                </button>
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Enhancing tracks...</span>
              <span className="text-sm text-gray-600">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {enhancedTracks.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">
              Enhanced Tracks Preview:
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {enhancedTracks.map((track, index) => (
                <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                  <div className="font-medium">{track.title}</div>
                  {track.bpm && (
                    <span className="inline-block mr-2 text-blue-600">
                      🎵 {Math.round(track.bpm)} BPM
                    </span>
                  )}
                  {track.key !== undefined && track.mode && (
                    <span className="inline-block mr-2 text-green-600">
                      🎼{" "}
                      {typeof track.key === "number"
                        ? getKeyName(track.key, track.mode === "minor" ? 0 : 1)
                        : track.key}
                    </span>
                  )}
                  {track.energy && (
                    <span className="inline-block text-orange-600">
                      ⚡ {Math.round(track.energy * 100)}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={enhanceAlbumWithSpotify}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Enhancing..." : "Enhance with Spotify Data"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>
            Note: This process may take a few minutes depending on the number of
            tracks.
          </p>
          <p>Rate limits apply: 1000 requests per hour to Spotify API.</p>
        </div>
      </div>
    </div>
  );
};

export default SpotifyEnhancer;
