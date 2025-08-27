import React, { useState, useEffect, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";

interface User {
  _id: string;
  email: string;
  username: string;
  isVerified: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token in localStorage
    const savedToken = localStorage.getItem("auth_token");
    if (savedToken) {
      // Verify token with backend
      verifyToken(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    const response = await fetch("http://localhost:5050/auth/verify", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const userData = await response.json();
      setUser(userData);
      setToken(token);
    } else {
      localStorage.removeItem("auth_token");
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    const response = await fetch("http://localhost:5050/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Login failed");
    }

    const data = await response.json();
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("auth_token", data.token);
  };

  const register = async (
    email: string,
    username: string,
    password: string
  ) => {
    const response = await fetch("http://localhost:5050/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Registration failed");
    }

    // Registration successful - user needs to verify email
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
  };

  const verifyEmail = async (token: string) => {
    const response = await fetch("http://localhost:5050/auth/verify-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Email verification failed");
    }

    // Email verified successfully
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    verifyEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
