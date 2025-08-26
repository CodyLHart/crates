import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

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
  // Additional fields for enhanced album data
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

interface Collection {
  _id: string;
  name: string;
  description: string;
  records: Album[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface AlbumCardProps {
  album: Album;
  deleteAlbum: (id: string) => void;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ album, deleteAlbum }) => (
  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
    <div className="flex items-start gap-4">
      {album.thumb && (
        <img
          src={album.thumb}
          alt={album.title}
          className="w-20 h-20 object-cover rounded"
        />
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate text-lg">
          {album.title}
        </h3>
        <p className="text-gray-600 text-sm truncate">{album.artist}</p>
        {album.year && <p className="text-gray-500 text-xs">{album.year}</p>}

        {/* Spotify Data Display */}
        {album.tracks && album.tracks.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {/* Average BPM */}
            {(() => {
              const tracksWithBpm = album.tracks.filter((track) => track.bpm);
              if (tracksWithBpm.length > 0) {
                const avgBpm = Math.round(
                  tracksWithBpm.reduce(
                    (sum, track) => sum + (track.bpm || 0),
                    0
                  ) / tracksWithBpm.length
                );
                return (
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    🎵 {avgBpm} BPM
                  </span>
                );
              }
              return null;
            })()}

            {/* Key information */}
            {(() => {
              const tracksWithKey = album.tracks.filter(
                (track) => track.key !== undefined
              );
              if (tracksWithKey.length > 0) {
                const keys = tracksWithKey
                  .map((track) => track.key)
                  .filter(Boolean);
                const uniqueKeys = [...new Set(keys)];
                if (uniqueKeys.length > 0) {
                  return (
                    <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      🎼 {uniqueKeys.slice(0, 2).join(", ")}
                      {uniqueKeys.length > 2 ? "..." : ""}
                    </span>
                  );
                }
              }
              return null;
            })()}

            {/* Energy level */}
            {(() => {
              const tracksWithEnergy = album.tracks.filter(
                (track) => track.energy
              );
              if (tracksWithEnergy.length > 0) {
                const avgEnergy = Math.round(
                  tracksWithEnergy.reduce(
                    (sum, track) => sum + (track.energy || 0),
                    0
                  ) / tracksWithEnergy.length
                );
                return (
                  <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                    ⚡ {avgEnergy}%
                  </span>
                );
              }
              return null;
            })()}
          </div>
        )}

        <p className="text-gray-400 text-xs mt-2">
          Added {new Date(album.addedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
    <div className="mt-4 flex gap-2">
      <Link
        to={`/album/${album._id}`}
        className="flex-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
      >
        View Album Details
      </Link>
      <button
        onClick={() => deleteAlbum(album._id!)}
        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        Remove
      </button>
    </div>
  </div>
);

const MyCollection: React.FC = () => {
  const { user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("addedAt");
  const [bpmFilter, setBpmFilter] = useState<string>("all");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Fetch albums from the database
  useEffect(() => {
    async function getAlbums() {
      if (!user || !token) return;

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5050/collection/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch collection: ${response.statusText}`);
        }
        const collections: Collection[] = await response.json();

        // Extract albums from collections
        const allAlbums: Album[] = [];
        collections.forEach((collection: Collection) => {
          if (collection.records && Array.isArray(collection.records)) {
            allAlbums.push(...collection.records);
          }
        });

        setAlbums(allAlbums);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    getAlbums();
  }, [user, token]);

  // Delete an album from the collection
  async function deleteAlbum(id: string): Promise<void> {
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:5050/collection/album/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete album: ${response.statusText}`);
      }

      setAlbums(albums.filter((album) => album._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete album");
    }
  }

  // Sort albums based on selected criteria
  const getSortedAlbums = () => {
    const sorted = [...albums];

    switch (sortBy) {
      case "title":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "artist":
        return sorted.sort((a, b) => a.artist.localeCompare(b.artist));
      case "year":
        return sorted.sort((a, b) =>
          (a.year || "").localeCompare(b.year || "")
        );
      case "bpm":
        return sorted.sort((a, b) => {
          const aBpm = a.tracks?.[0]?.bpm || 0;
          const bBpm = b.tracks?.[0]?.bpm || 0;
          return aBpm - bBpm;
        });
      case "addedAt":
      default:
        return sorted.sort(
          (a, b) =>
            new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        );
    }
  };

  // Filter albums by BPM range
  const getFilteredAlbums = () => {
    const sorted = getSortedAlbums();

    if (bpmFilter === "all") return sorted;

    return sorted.filter((album) => {
      if (!album.tracks || album.tracks.length === 0) return false;

      const avgBpm =
        album.tracks.reduce((sum, track) => sum + (track.bpm || 0), 0) /
        album.tracks.length;

      switch (bpmFilter) {
        case "slow":
          return avgBpm < 100;
        case "medium":
          return avgBpm >= 100 && avgBpm < 140;
        case "fast":
          return avgBpm >= 140;
        default:
          return true;
      }
    });
  };

  const filteredAlbums = getFilteredAlbums();

  if (authLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your collection...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-red-600 text-lg">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Music Collection</h1>
        <p className="text-gray-600">
          {filteredAlbums.length === 0
            ? "Your collection is empty. Search for albums to add them!"
            : `${filteredAlbums.length} album${
                filteredAlbums.length !== 1 ? "s" : ""
              } in your collection`}
        </p>
      </div>

      {/* Sorting and Filtering Controls */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="addedAt">Date Added</option>
            <option value="title">Title</option>
            <option value="artist">Artist</option>
            <option value="year">Year</option>
            <option value="bpm">BPM (Tempo)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            BPM Filter:
          </label>
          <select
            value={bpmFilter}
            onChange={(e) => setBpmFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Tempos</option>
            <option value="slow">Slow (&lt;100 BPM)</option>
            <option value="medium">Medium (100-139 BPM)</option>
            <option value="fast">Fast (≥140 BPM)</option>
          </select>
        </div>

        {sortBy === "bpm" && (
          <div className="text-sm text-gray-600">
            💡 Showing albums sorted by average track BPM
          </div>
        )}
      </div>

      {filteredAlbums.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🎵</div>
          <p className="text-gray-500 text-lg mb-4">
            {albums.length === 0
              ? "No albums in your collection yet"
              : "No albums match your current filters"}
          </p>
          <p className="text-gray-400">
            {albums.length === 0
              ? "Use the Discogs Search to find and add albums to your collection!"
              : "Try adjusting your sorting or filtering options"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlbums.map((album) => (
            <AlbumCard
              key={album._id}
              album={album}
              deleteAlbum={deleteAlbum}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCollection;
