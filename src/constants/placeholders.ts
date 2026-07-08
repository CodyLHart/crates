export type PlaceholderRoute = {
  title: string;
  eyebrow: string;
  description: string;
};

export const placeholderRoutes = {
  auth: {
    title: "Your collection stays private.",
    eyebrow: "Deferred",
    description:
      "Authentication will arrive later; this shell currently uses local demo data only.",
  },
  home: {
    title: "Home",
    eyebrow: "App Shell",
    description:
      "Collection moments, recent activity, and rediscovery prompts now begin from local demo data.",
  },
  collection: {
    title: "Collection",
    eyebrow: "Copies",
    description: "A copy-centric browser keeps ownership details close to the artwork.",
  },
  crates: {
    title: "Crates",
    eyebrow: "Organization",
    description: "Custom groupings show how Copies can belong to more than one listening context.",
  },
  journal: {
    title: "Journal",
    eyebrow: "Remember",
    description: "Copy journals preview memories, notes, purchases, and listening events.",
  },
  settings: {
    title: "Settings",
    eyebrow: "Preferences",
    description:
      "Account, provider, and app preferences remain deferred while the shell stays local.",
  },
  copy: {
    title: "Copy Detail",
    eyebrow: "Ownership",
    description: "This route centers one user-owned physical Copy and its personal context.",
  },
  crate: {
    title: "Crate Detail",
    eyebrow: "Organization",
    description: "This route will eventually open one Crate and the Copies gathered inside it.",
  },
  artist: {
    title: "Artist Detail",
    eyebrow: "Collection",
    description: "This route will collect artists represented by user-owned Copies.",
  },
  track: {
    title: "Track Detail",
    eyebrow: "Listening",
    description: "This route will hold future track-level context, notes, and listening details.",
  },
} satisfies Record<string, PlaceholderRoute>;
