import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Toast from "./Toast";

interface DiscogsItem {
  id: number;
  title: string;
  artist?: string;
  year?: string;
  thumb?: string;
  type: string;
  name?: string;
  artistId?: number;
}

interface DiscogsRelease {
  id: number;
  title: string;
  year?: string;
  thumb?: string;
}

interface DiscogsSearchResponse {
  results: DiscogsItem[];
  pagination: {
    page: number;
    pages: number;
    per_page: number;
    items: number;
  };
}

interface DiscogsFormat {
  name: string;
  qty: string;
  descriptions?: string[];
}

interface DiscogsLabel {
  name: string;
  catno: string;
  entity_type: string;
  entity_type_name: string;
  id: number;
  resource_url: string;
}

interface DiscogsIdentifier {
  type: string;
  value: string;
}

interface DiscogsTrack {
  position: string;
  title: string;
  duration: string;
  artists?: Array<{ name: string }>;
}

interface DiscogsReleaseData {
  id: number;
  title: string;
  year?: string;
  thumb?: string;
  genres?: string[];
  styles?: string[];
  country?: string;
  formats?: DiscogsFormat[];
  labels?: DiscogsLabel[];
  identifiers?: DiscogsIdentifier[];
  tracklist?: DiscogsTrack[];
  notes?: string;
  master_id?: number;
  status?: string;
  artists?: Array<{ name: string }>;
}

const DiscogsSearch: React.FC = () => {
  const { user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DiscogsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<DiscogsItem | null>(null);
  const [searchType, setSearchType] = useState<"both" | "artist" | "album">(
    "both"
  );
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
    isVisible: boolean;
  }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const searchItems = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const results: DiscogsItem[] = [];

      if (searchType === "both" || searchType === "artist") {
        const artistResponse = await fetch(
          `http://localhost:5050/api/discogs/search?q=${encodeURIComponent(
            searchQuery
          )}&type=artist&per_page=20`
        );

        if (!artistResponse.ok) {
          throw new Error(`Artist search failed: ${artistResponse.statusText}`);
        }

        const artistData: DiscogsSearchResponse = await artistResponse.json();
        results.push(
          ...(artistData.results || []).map((item) => ({
            ...item,
            name: item.title || item.name,
            type: "artist",
          }))
        );
      }

      if (searchType === "both" || searchType === "album") {
        const albumResponse = await fetch(
          `http://localhost:5050/api/discogs/search?q=${encodeURIComponent(
            searchQuery
          )}&type=release&format=vinyl&per_page=20`
        );

        if (!albumResponse.ok) {
          throw new Error(`Album search failed: ${albumResponse.statusText}`);
        }

        const albumData: DiscogsSearchResponse = await albumResponse.json();
        results.push(
          ...(albumData.results || []).map((item) => ({
            ...item,
            type: "album",
          }))
        );
      }

      setResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchItems(query);
  };

  const handleItemClick = async (item: DiscogsItem) => {
    if (item.type === "artist") {
      // Fetch artist's albums
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5050/api/discogs/artists/${item.id}/releases?format=vinyl&per_page=20`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch artist albums: ${response.statusText}`
          );
        }

        const data = await response.json();
        const artistAlbums: DiscogsItem[] = (data.releases || []).map(
          (release: DiscogsRelease) => ({
            id: release.id,
            title: release.title,
            artist: item.title || item.name,
            year: release.year,
            thumb: release.thumb,
            type: "album",
            artistId: item.id,
          })
        );

        setResults(artistAlbums);
        setQuery(`${item.title || item.name} - Albums`);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load artist albums"
        );
      } finally {
        setLoading(false);
      }
    } else {
      setSelectedItem(item);
    }
  };

  const handleAddToCollection = async (item: DiscogsItem) => {
    if (!token) {
      setToast({
        message: "Please log in to add albums to your collection",
        type: "error",
        isVisible: true,
      });
      return;
    }

    try {
      // First, fetch full release details from Discogs
      const releaseResponse = await fetch(
        `http://localhost:5050/api/discogs/releases/${item.id}`
      );

      if (!releaseResponse.ok) {
        throw new Error(
          `Failed to fetch release details: ${releaseResponse.statusText}`
        );
      }

      const releaseData: DiscogsReleaseData = await releaseResponse.json();

      // Debug logging to see what artist information we're getting
      console.log("Release data:", releaseData);
      console.log("Item artist:", item.artist);
      console.log("Release artists:", releaseData.artists);
      console.log(
        "Selected artist:",
        releaseData.artists?.[0]?.name || item.artist || "Unknown Artist"
      );

      // Prepare enhanced album data with all available information
      const albumData = {
        title: item.title || item.name || "Unknown",
        artist:
          releaseData.artists?.[0]?.name || item.artist || "Unknown Artist",
        year: item.year,
        thumb: item.thumb,
        discogsId: item.id,
        addedAt: new Date().toISOString(),
        // Additional fields from full release data
        genre: releaseData.genres || [],
        style: releaseData.styles || [],
        country: releaseData.country,
        format: releaseData.formats?.map((f: DiscogsFormat) => f.name) || [],
        label: releaseData.labels?.[0]?.name,
        catno: releaseData.labels?.[0]?.catno,
        barcode: releaseData.identifiers?.find(
          (i: DiscogsIdentifier) => i.type === "Barcode"
        )?.value,
        tracks:
          releaseData.tracklist?.map((track: DiscogsTrack) => ({
            position: track.position,
            title: track.title,
            duration: track.duration,
            artists: track.artists?.map((a: { name: string }) => a.name),
          })) || [],
        notes: releaseData.notes,
        masterId: releaseData.master_id,
        status: releaseData.status,
      };

      const response = await fetch("http://localhost:5050/collection/album", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(albumData),
      });

      if (!response.ok) {
        throw new Error(`Failed to add album: ${response.statusText}`);
      }

      const displayName = item.title || item.name || "Unknown";
      const artist =
        releaseData.artists?.[0]?.name || item.artist || "Unknown Artist";
      setToast({
        message: `Added "${displayName}" by ${artist} to your collection!`,
        type: "success",
        isVisible: true,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add album";
      setToast({
        message: `Error: ${errorMessage}`,
        type: "error",
        isVisible: true,
      });
    }
  };

  const handleBackToSearch = () => {
    setResults([]);
    setQuery("");
    setError(null);
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Discogs{" "}
          {searchType === "both"
            ? "Artist & Album"
            : searchType === "artist"
            ? "Artist"
            : "Album"}{" "}
          Search
        </h1>
        <p className="text-gray-600">
          Search for{" "}
          {searchType === "both"
            ? "artists and vinyl albums"
            : searchType === "artist"
            ? "artists"
            : "vinyl albums"}{" "}
          from the Discogs database
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        {/* Back to Search Button (when viewing artist albums) */}
        {results.length > 0 && results[0]?.artistId && (
          <div className="mb-4">
            <button
              type="button"
              onClick={handleBackToSearch}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← Back to Search
            </button>
          </div>
        )}

        {/* Search Type Toggle */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Type
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSearchType("both")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                searchType === "both"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Both
            </button>
            <button
              type="button"
              onClick={() => setSearchType("artist")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                searchType === "artist"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Artists Only
            </button>
            <button
              type="button"
              onClick={() => setSearchType("album")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                searchType === "album"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Albums Only
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search for ${
              searchType === "both"
                ? "artists or vinyl albums"
                : searchType === "artist"
                ? "artists"
                : "vinyl albums"
            }...`}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <>
          {/* Results Header */}
          {results[0]?.artistId && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {results[0]?.artist} - Albums
              </h2>
              <p className="text-gray-600">
                {results.length} album{results.length !== 1 ? "s" : ""} found
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((release) => (
              <div
                key={release.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleItemClick(release)}
              >
                <div className="flex items-start gap-4">
                  {release.thumb && (
                    <img
                      src={release.thumb}
                      alt={release.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {release.title || release.name}
                    </h3>
                    {release.artist && (
                      <p className="text-gray-600 text-sm truncate">
                        {release.artist}
                      </p>
                    )}
                    {release.year && (
                      <p className="text-gray-500 text-xs">{release.year}</p>
                    )}
                    <p className="text-gray-400 text-xs capitalize">
                      {release.type}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCollection(release);
                    }}
                    className="flex-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Add to Collection
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(
                        `https://www.discogs.com/release/${release.id}`,
                        "_blank"
                      );
                    }}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    View on Discogs
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* No Results */}
      {!loading && query && results.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No results found for "{query}"
          </p>
          <p className="text-gray-400">Try a different search term</p>
        </div>
      )}

      {/* Selected Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">
                  {selectedItem.title || selectedItem.name}
                </h2>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="flex gap-6">
                {selectedItem.thumb && (
                  <img
                    src={selectedItem.thumb}
                    alt={selectedItem.title || selectedItem.name}
                    className="w-32 h-32 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  {selectedItem.artist && (
                    <p className="text-lg text-gray-600 mb-2">
                      <strong>Artist:</strong> {selectedItem.artist}
                    </p>
                  )}
                  {selectedItem.year && (
                    <p className="text-lg text-gray-600 mb-2">
                      <strong>Year:</strong> {selectedItem.year}
                    </p>
                  )}
                  <p className="text-lg text-gray-600 mb-4">
                    <strong>Type:</strong> {selectedItem.type}
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAddToCollection(selectedItem)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Add to Collection
                    </button>
                    <button
                      onClick={() =>
                        window.open(
                          `https://www.discogs.com/release/${selectedItem.id}`,
                          "_blank"
                        )
                      }
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      View on Discogs
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={closeToast}
      />
    </div>
  );
};

export default DiscogsSearch;
