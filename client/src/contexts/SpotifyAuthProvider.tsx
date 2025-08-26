import React, { useState, useEffect, type ReactNode } from "react";
import { SpotifyAuthContext } from "./SpotifyAuthContext";

interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: number;
}

interface SpotifyAuthProviderProps {
  children: ReactNode;
}

export const SpotifyAuthProvider: React.FC<SpotifyAuthProviderProps> = ({
  children,
}) => {
  const [tokens, setTokens] = useState<SpotifyTokens | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing tokens in localStorage
    const savedTokens = localStorage.getItem("spotify_tokens");
    if (savedTokens) {
      try {
        const parsedTokens = JSON.parse(savedTokens);
        if (parsedTokens.expiresAt > Date.now()) {
          setTokens(parsedTokens);
          setIsAuthenticated(true);
        } else {
          // Tokens expired, try to refresh
          refreshTokens();
        }
      } catch (error) {
        console.error("Error parsing saved Spotify tokens:", error);
        localStorage.removeItem("spotify_tokens");
      }
    }
  }, []);

  const login = () => {
    // Get the auth URL from the server
    fetch("http://localhost:5050/api/spotify/auth")
      .then((response) => response.json())
      .then((data) => {
        // Open Spotify OAuth in a popup
        const popup = window.open(
          data.authUrl,
          "spotify-auth",
          "width=500,height=600,scrollbars=yes,resizable=yes"
        );

        // Listen for the callback
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            // Check if we have tokens in localStorage (set by callback)
            const savedTokens = localStorage.getItem("spotify_tokens");
            if (savedTokens) {
              try {
                const parsedTokens = JSON.parse(savedTokens);
                setTokens(parsedTokens);
                setIsAuthenticated(true);
              } catch (error) {
                console.error("Error parsing tokens after auth:", error);
              }
            }
          }
        }, 1000);
      })
      .catch((error) => {
        console.error("Error getting Spotify auth URL:", error);
      });
  };

  const logout = () => {
    setTokens(null);
    setIsAuthenticated(false);
    localStorage.removeItem("spotify_tokens");
  };

  const refreshTokens = async () => {
    if (!tokens?.refreshToken) {
      logout();
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5050/api/spotify/refresh",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refreshToken: tokens.refreshToken,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const newTokens: SpotifyTokens = {
          accessToken: data.accessToken,
          refreshToken: tokens.refreshToken, // Keep the same refresh token
          expiresIn: data.expiresIn,
          expiresAt: Date.now() + data.expiresIn * 1000,
        };

        setTokens(newTokens);
        setIsAuthenticated(true);
        localStorage.setItem("spotify_tokens", JSON.stringify(newTokens));
      } else {
        throw new Error("Failed to refresh tokens");
      }
    } catch (error) {
      console.error("Error refreshing Spotify tokens:", error);
      logout();
    }
  };

  const value = {
    isAuthenticated,
    tokens,
    login,
    logout,
    refreshTokens,
  };

  return (
    <SpotifyAuthContext.Provider value={value}>
      {children}
    </SpotifyAuthContext.Provider>
  );
};
