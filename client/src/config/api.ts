// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050';

export const config = {
  apiBaseUrl: API_BASE_URL,
  endpoints: {
    auth: {
      login: `${API_BASE_URL}/auth/login`,
      register: `${API_BASE_URL}/auth/register`,
      verify: `${API_BASE_URL}/auth/verify`,
      verifyEmail: `${API_BASE_URL}/auth/verify-email`,
    },
    collection: {
      albums: `${API_BASE_URL}/collection/`,
      album: (id: string) => `${API_BASE_URL}/collection/album/${id}`,
    },
    discogs: {
      search: `${API_BASE_URL}/api/discogs/search`,
      releases: (id: string) => `${API_BASE_URL}/api/discogs/releases/${id}`,
      artistReleases: (id: string) => `${API_BASE_URL}/api/discogs/artists/${id}/releases`,
    },
    spotify: {
      auth: `${API_BASE_URL}/api/spotify/auth`,
      callback: `${API_BASE_URL}/api/spotify/callback`,
      refresh: `${API_BASE_URL}/api/spotify/refresh`,
      searchTrackWithFeatures: `${API_BASE_URL}/api/spotify/search-track-with-features`,
    },
  },
};

// Helper function to check if we're in development mode
export const isDevelopment = import.meta.env.DEV;

// Helper function to check if backend is available
export const isBackendAvailable = () => {
  return isDevelopment || import.meta.env.VITE_API_BASE_URL !== 'http://localhost:5050';
};
