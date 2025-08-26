import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import SpotifyEnhancer from "./SpotifyEnhancer";

interface Track {
  position: string;
  title: string;
  duration?: string;
  artists?: string[];
  // Spotify audio features
  spotifyId?: string;
  bpm?: number;
  key?: string;
  mode?: string; // major/minor
  energy?: number;
  danceability?: number;
  acousticness?: number;
  instrumentalness?: number;
  valence?: number; // happiness
  tempo?: number; // alternative to BPM
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

const AlbumDetail: React.FC = () => {
  const { albumId } = useParams<{ albumId: string }>();
  const navigate = useNavigate();
  const { user, token, loading: authLoading } = useAuth();
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSpotifyEnhancer, setShowSpotifyEnhancer] = useState(false);
  const [expandedTracks, setExpandedTracks] = useState<Set<string>>(new Set());
  const [isEditingArtist, setIsEditingArtist] = useState(false);
  const [editedArtist, setEditedArtist] = useState("");
  const [isUpdatingArtist, setIsUpdatingArtist] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (albumId && token) {
      fetchAlbumDetails();
    }
  }, [albumId, token, user, authLoading, navigate]);

  const fetchAlbumDetails = async () => {
    if (!albumId || !token) return;

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5050/collection/album/${albumId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch album: ${response.statusText}`);
      }

      const albumData = await response.json();
      setAlbum(albumData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSpotifyEnhance = (enhancedAlbum: Album) => {
    setAlbum(enhancedAlbum);
    setShowSpotifyEnhancer(false);
    // Here you could also save the enhanced album to the database
  };

  const toggleTrackExpansion = (trackId: string) => {
    setExpandedTracks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(trackId)) {
        newSet.delete(trackId);
      } else {
        newSet.add(trackId);
      }
      return newSet;
    });
  };

  const startEditingArtist = () => {
    if (album) {
      setEditedArtist(album.artist || "");
      setIsEditingArtist(true);
    }
  };

  const cancelEditingArtist = () => {
    setIsEditingArtist(false);
    setEditedArtist("");
  };

  const updateArtist = async () => {
    if (!album || !editedArtist.trim() || editedArtist === album.artist) {
      cancelEditingArtist();
      return;
    }

    setIsUpdatingArtist(true);
    try {
      const response = await fetch(
        `http://localhost:5050/collection/album/${albumId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ artist: editedArtist.trim() }),
        }
      );

      if (response.ok) {
        // Update the local album state
        setAlbum({ ...album, artist: editedArtist.trim() });
        setIsEditingArtist(false);
        setEditedArtist("");
      } else {
        throw new Error("Failed to update artist");
      }
    } catch (error) {
      console.error("Error updating artist:", error);
      setError("Failed to update artist name");
    } finally {
      setIsUpdatingArtist(false);
    }
  };

  const getKeyName = (key: number, mode: string) => {
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
    return `${keys[key]} ${mode}`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading album details...</p>
        </div>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <p className="text-gray-600 mb-4">{error || "Album not found"}</p>
          <Link
            to="/"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Collection
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{album.title}</h1>

        {isEditingArtist ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editedArtist}
              onChange={(e) => setEditedArtist(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-gray-900"
              placeholder="Enter artist name"
              disabled={isUpdatingArtist}
            />
            <button
              onClick={updateArtist}
              disabled={isUpdatingArtist}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isUpdatingArtist ? "Saving..." : "Save"}
            </button>
            <button
              onClick={cancelEditingArtist}
              disabled={isUpdatingArtist}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-lg text-gray-600">{album.artist}</span>
            {album.artist === "Unknown Artist" && (
              <button
                onClick={startEditingArtist}
                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Fix Artist
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Album Art and Basic Info */}
        <div className="lg:col-span-1">
          {album.thumb && (
            <div className="mb-6">
              <img
                src={album.thumb}
                alt={album.title}
                className="w-full max-w-sm mx-auto rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Basic Information
            </h3>
            <div className="space-y-2 text-sm">
              {album.year && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Year:</span>
                  <span className="font-medium text-gray-900">
                    {album.year}
                  </span>
                </div>
              )}
              {album.country && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Country:</span>
                  <span className="font-medium text-gray-900">
                    {album.country}
                  </span>
                </div>
              )}
              {album.status && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-gray-900">
                    {album.status}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Added:</span>
                <span className="font-medium text-gray-900">
                  {new Date(album.addedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Format Information */}
          {album.format && album.format.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Format</h3>
              <div className="flex flex-wrap gap-2">
                {album.format.map((fmt, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Label Information */}
          {album.label && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Label</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Label:</span>
                  <span className="font-medium text-gray-900">
                    {album.label}
                  </span>
                </div>
                {album.catno && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Catalog #:</span>
                    <span className="font-medium text-gray-900">
                      {album.catno}
                    </span>
                  </div>
                )}
                {album.barcode && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Barcode:</span>
                    <span className="font-medium font-mono text-gray-900">
                      {album.barcode}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Track Listing and Additional Info */}
        <div className="lg:col-span-2">
          {/* Track Listing */}
          {album.tracks && album.tracks.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                Track Listing
              </h3>
              <div className="space-y-3">
                {album.tracks.map((track, index) => {
                  const trackId = `${track.position}-${track.title}`;
                  const isExpanded = expandedTracks.has(trackId);
                  const hasSpotifyData =
                    track.bpm || track.key !== undefined || track.energy;

                  return (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      {/* Track Header - Always Visible */}
                      <div
                        className={`flex items-center justify-between py-3 px-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          hasSpotifyData ? "cursor-pointer" : "cursor-default"
                        }`}
                        onClick={() =>
                          hasSpotifyData && toggleTrackExpansion(trackId)
                        }
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-mono text-gray-500 w-8">
                              {track.position}
                            </span>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {track.title}
                              </p>
                              {track.artists && track.artists.length > 0 && (
                                <p className="text-sm text-gray-600">
                                  {track.artists.join(", ")}
                                </p>
                              )}

                              {/* Spotify Audio Features Summary */}
                              {hasSpotifyData ? (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {track.bpm && (
                                    <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                      🎵 {Math.round(track.bpm)} BPM
                                    </span>
                                  )}
                                  {track.key !== undefined && track.mode && (
                                    <span className="inline-flex items-center px-2 py-1 bg-green-100 text-blue-800 text-xs rounded-full">
                                      🎼{" "}
                                      {typeof track.key === "number" &&
                                      track.mode
                                        ? getKeyName(track.key, track.mode)
                                        : `${track.key} ${track.mode}`}
                                    </span>
                                  )}
                                  {track.energy && (
                                    <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                                      ⚡ {Math.round(track.energy * 100)}%
                                    </span>
                                  )}
                                  {track.danceability && (
                                    <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                      💃 {Math.round(track.danceability * 100)}%
                                    </span>
                                  )}
                                  {track.acousticness &&
                                    track.acousticness > 0.7 && (
                                      <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                        🎸 Acoustic
                                      </span>
                                    )}
                                  {track.instrumentalness &&
                                    track.instrumentalness > 0.7 && (
                                      <span className="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                                        🎺 Instrumental
                                      </span>
                                    )}
                                </div>
                              ) : (
                                <div className="mt-2">
                                  <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    💡 No Spotify data yet
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {track.duration && (
                            <span className="text-sm text-gray-500 font-mono">
                              {track.duration}
                            </span>
                          )}

                          {/* Expand/Collapse Button */}
                          {hasSpotifyData && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTrackExpansion(trackId);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {isExpanded ? (
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 15l7-7 7 7"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expandable Spotify Data Drawer */}
                      {isExpanded && hasSpotifyData && (
                        <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 animate-in slide-in-from-top-2 duration-200">
                          <h4 className="font-medium text-gray-900 mb-3 text-sm flex items-center gap-2">
                            🎵 Spotify Audio Features
                            <span className="text-xs text-gray-500 font-normal">
                              (Click track to collapse)
                            </span>
                          </h4>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {/* Tempo & Key Section */}
                            <div className="space-y-2">
                              <h5 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                                Tempo & Key
                              </h5>
                              {track.bpm && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">BPM:</span>
                                  <span className="font-medium text-gray-900">
                                    {Math.round(track.bpm)}
                                  </span>
                                </div>
                              )}
                              {track.key !== undefined && track.mode && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Key:</span>
                                  <span className="font-medium text-gray-900">
                                    {typeof track.key === "number" && track.mode
                                      ? getKeyName(track.key, track.mode)
                                      : `${track.key} ${track.mode}`}
                                  </span>
                                </div>
                              )}
                              {track.tempo && track.tempo !== track.bpm && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Tempo:</span>
                                  <span className="font-medium text-gray-900">
                                    {Math.round(track.tempo)}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Energy & Mood Section */}
                            <div className="space-y-2">
                              <h5 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                                Energy & Mood
                              </h5>
                              {track.energy !== undefined && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Energy:</span>
                                  <span className="font-medium text-gray-900">
                                    {Math.round(track.energy * 100)}%
                                  </span>
                                </div>
                              )}
                              {track.valence !== undefined && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    Happiness:
                                  </span>
                                  <span className="font-medium text-gray-900">
                                    {Math.round(track.valence * 100)}%
                                  </span>
                                </div>
                              )}
                              {track.danceability !== undefined && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    Danceability:
                                  </span>
                                  <span className="font-medium text-gray-900">
                                    {Math.round(track.danceability * 100)}%
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Characteristics Section */}
                            <div className="space-y-2">
                              <h5 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                                Characteristics
                              </h5>
                              {track.acousticness !== undefined && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    Acoustic:
                                  </span>
                                  <span className="font-medium text-gray-900">
                                    {Math.round(track.acousticness * 100)}%
                                  </span>
                                </div>
                              )}
                              {track.instrumentalness !== undefined && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    Instrumental:
                                  </span>
                                  <span className="font-medium text-gray-900">
                                    {Math.round(track.instrumentalness * 100)}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Visual Bars for Key Metrics */}
                          <div className="mt-4 space-y-3">
                            <h5 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                              Key Metrics
                            </h5>

                            {track.energy !== undefined && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-600">Energy</span>
                                  <span className="text-gray-900">
                                    {Math.round(track.energy * 100)}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${track.energy * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}

                            {track.danceability !== undefined && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-600">
                                    Danceability
                                  </span>
                                  <span className="text-gray-900">
                                    {Math.round(track.danceability * 100)}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                                    style={{
                                      width: `${track.danceability * 100}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            )}

                            {track.acousticness !== undefined && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-600">
                                    Acousticness
                                  </span>
                                  <span className="text-gray-900">
                                    {Math.round(track.acousticness * 100)}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                                    style={{
                                      width: `${track.acousticness * 100}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Spotify Link */}
                          {track.spotifyId && (
                            <div className="mt-4 pt-3 border-t border-gray-200">
                              <a
                                href={`https://open.spotify.com/track/${track.spotifyId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 text-sm"
                              >
                                <span>Open in Spotify</span>
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Genre and Style */}
          {(album.genre || album.style) && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                Classification
              </h3>
              {album.genre && album.genre.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Genres
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {album.genre.map((g, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {album.style && album.style.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Styles
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {album.style.map((s, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {album.notes && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                Notes
              </h3>
              <p className="text-gray-800 whitespace-pre-wrap">{album.notes}</p>
            </div>
          )}

          {/* External Links */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">
              External Links
            </h3>
            <div className="space-y-3">
              <a
                href={`https://www.discogs.com/release/${album.discogsId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <span>View on Discogs</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
              {album.masterId && (
                <a
                  href={`https://www.discogs.com/master/${album.masterId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <span>View Master Release</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Spotify Enhancer Modal */}
      {showSpotifyEnhancer && album && (
        <SpotifyEnhancer
          album={album}
          onEnhance={handleSpotifyEnhance}
          onClose={() => setShowSpotifyEnhancer(false)}
        />
      )}

      {/* Spotify Enhancement Button */}
      {album.tracks && album.tracks.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowSpotifyEnhancer(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            🎵 Enhance with Spotify Data
          </button>
          <p className="text-sm text-gray-500 mt-1">
            Get BPM, key, energy, and other audio features for all tracks
          </p>
        </div>
      )}
    </div>
  );
};

export default AlbumDetail;
