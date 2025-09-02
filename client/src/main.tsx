import * as React from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthProvider";
import { SpotifyAuthProvider } from "./contexts/SpotifyAuthProvider";
import App from "./App";
import MyCollection from "./components/MyCollection";
import DiscogsSearch from "./components/DiscogsSearch";
import AlbumDetail from "./components/AlbumDetail";
import Login from "./components/Login";
import Register from "./components/Register";
import VerifyEmail from "./components/VerifyEmail";
import SpotifyCallback from "./components/SpotifyCallback";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";

const router = createHashRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmail />,
  },
  {
    path: "/spotify-callback",
    element: <SpotifyCallback />,
  },
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <MyCollection />,
      },
      {
        path: "/discogs",
        element: <DiscogsSearch />,
      },
      {
        path: "/album/:albumId",
        element: <AlbumDetail />,
      },
    ],
  },
  {
    path: "*",
    element: (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600 mb-8">Page not found</p>
          <a 
            href="#/" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Go Home
          </a>
        </div>
      </div>
    ),
  },
]);

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <SpotifyAuthProvider>
          <RouterProvider router={router} />
        </SpotifyAuthProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
