import React, { useState } from "react";

interface DiscogsRelease {
  id: number;
  title: string;
  artist: string;
  year?: string;
  thumb?: string;
  type: string;
}

interface DiscogsSearchResponse {
  results: DiscogsRelease[];
  pagination: {
    page: number;
    pages: number;
    per_page: number;
    items: number;
  };
}

const DiscogsSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DiscogsRelease[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRelease, setSelectedRelease] = useState<DiscogsRelease | null>(
    null
  );

  const searchReleases = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch(
        `http://localhost:5050/api/discogs/search?q=${encodeURIComponent(
          searchQuery
        )}&type=release&per_page=20`
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data: DiscogsSearchResponse = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchReleases(query);
  };

  const handleReleaseClick = (release: DiscogsRelease) => {
    setSelectedRelease(release);
  };

  const handleAddToCollection = async (release: DiscogsRelease) => {
    // TODO: Implement adding to your collection
    console.log("Adding to collection:", release);
    alert(`Added "${release.title}" by ${release.artist} to your collection!`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Discogs Album Search</h1>
        <p className="text-gray-600">
          Search for albums, artists, and releases from the Discogs database
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for albums, artists, or releases..."
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((release) => (
            <div
              key={release.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleReleaseClick(release)}
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
                    {release.title}
                  </h3>
                  <p className="text-gray-600 text-sm truncate">
                    {release.artist}
                  </p>
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

      {/* Selected Release Details Modal */}
      {selectedRelease && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedRelease.title}</h2>
                <button
                  onClick={() => setSelectedRelease(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="flex gap-6">
                {selectedRelease.thumb && (
                  <img
                    src={selectedRelease.thumb}
                    alt={selectedRelease.title}
                    className="w-32 h-32 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <p className="text-lg text-gray-600 mb-2">
                    <strong>Artist:</strong> {selectedRelease.artist}
                  </p>
                  {selectedRelease.year && (
                    <p className="text-gray-600 mb-2">
                      <strong>Year:</strong> {selectedRelease.year}
                    </p>
                  )}
                  <p className="text-gray-600 mb-4">
                    <strong>Type:</strong> {selectedRelease.type}
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAddToCollection(selectedRelease)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Add to Collection
                    </button>
                    <button
                      onClick={() =>
                        window.open(
                          `https://www.discogs.com/release/${selectedRelease.id}`,
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
    </div>
  );
};

export default DiscogsSearch;
