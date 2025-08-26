import { useContext } from "react";
import { SpotifyAuthContext } from "../contexts/SpotifyAuthContext";

export const useSpotifyAuth = () => {
  const context = useContext(SpotifyAuthContext);
  if (context === undefined) {
    throw new Error("useSpotifyAuth must be used within a SpotifyAuthProvider");
  }
  return context;
};
