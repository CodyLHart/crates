export type PlaceholderRoute = {
  title: string;
  eyebrow: string;
  description: string;
};

export const placeholderRoutes = {
  auth: {
    title: "Auth",
    eyebrow: "Milestone 2",
    description: "Authentication screens will live here after the app foundation is stable.",
  },
  home: {
    title: "Home",
    eyebrow: "App Shell",
    description: "A future home for collection moments, recent activity, and rediscovery prompts.",
  },
  collection: {
    title: "Collection",
    eyebrow: "Copies",
    description: "The copy-centric collection browser will be implemented in a later milestone.",
  },
  crates: {
    title: "Crates",
    eyebrow: "Organization",
    description: "Custom groupings of Copies will appear here once product features begin.",
  },
  journal: {
    title: "Journal",
    eyebrow: "Remember",
    description: "Copy journals and listening history are intentionally deferred for now.",
  },
  settings: {
    title: "Settings",
    eyebrow: "Preferences",
    description: "Account, provider, and app preferences will be introduced in later milestones.",
  },
  copy: {
    title: "Copy Detail",
    eyebrow: "Route Placeholder",
    description: "This route is reserved for a single user-owned physical Copy.",
  },
  crate: {
    title: "Crate Detail",
    eyebrow: "Route Placeholder",
    description: "This route is reserved for an individual Crate of Copies.",
  },
  artist: {
    title: "Artist Detail",
    eyebrow: "Route Placeholder",
    description: "This route is reserved for artists represented in the user's collection.",
  },
  track: {
    title: "Track Detail",
    eyebrow: "Route Placeholder",
    description: "This route is reserved for track-level context and future notes.",
  },
} satisfies Record<string, PlaceholderRoute>;
