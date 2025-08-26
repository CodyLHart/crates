import { createContext } from "react";

interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: number;
}

interface SpotifyAuthContextType {
  isAuthenticated: boolean;
  tokens: SpotifyTokens | null;
  login: () => void;
  logout: () => void;
  refreshTokens: () => Promise<void>;
}

export const SpotifyAuthContext = createContext<
  SpotifyAuthContextType | undefined
>(undefined);
