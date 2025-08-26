import * as React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SpotifyAuthProvider } from "./contexts/SpotifyAuthProvider";
import App from "./App";
import MyCollection from "./components/MyCollection";
import DiscogsSearch from "./components/DiscogsSearch";
import AlbumDetail from "./components/AlbumDetail";
import Login from "./components/Login";
import Register from "./components/Register";
import VerifyEmail from "./components/VerifyEmail";
import SpotifyCallback from "./components/SpotifyCallback";
import "./index.css";

const router = createBrowserRouter([
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
]);

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(
  <React.StrictMode>
    <AuthProvider>
      <SpotifyAuthProvider>
        <RouterProvider router={router} />
      </SpotifyAuthProvider>
    </AuthProvider>
  </React.StrictMode>
);
