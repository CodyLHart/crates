import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const SpotifyCallback: React.FC = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      console.error("Spotify OAuth error:", error);
      window.close();
      return;
    }

    if (code) {
      // Exchange the authorization code for tokens
      fetch("http://localhost:5050/api/spotify/callback?code=" + code)
        .then((response) => response.json())
        .then((data) => {
          if (data.accessToken && data.refreshToken) {
            // Store tokens in localStorage
            const tokens = {
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              expiresIn: data.expiresIn,
              expiresAt: Date.now() + data.expiresIn * 1000,
            };

            localStorage.setItem("spotify_tokens", JSON.stringify(tokens));

            // Close the popup
            window.close();
          } else {
            console.error("No tokens received from Spotify");
            window.close();
          }
        })
        .catch((error) => {
          console.error("Error exchanging code for tokens:", error);
          window.close();
        });
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing Spotify login...</p>
      </div>
    </div>
  );
};

export default SpotifyCallback;
