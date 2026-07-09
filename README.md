# Crates

**Crates is the home for your physical music collection.**

Crates is an offline-first mobile app for organizing, journaling, and rediscovering the music you physically own.

The app begins as a vinyl-first experience while remaining architecturally open to CDs, cassettes, and other physical music formats in future releases.

---

# Project Status

Crates is in early implementation.

Milestone 1 has been scaffolded:

- Expo
- React Native
- TypeScript
- Expo Router
- React Native `StyleSheet` and design tokens
- ESLint
- Prettier
- Jest
- React Native Testing Library
- Initial app and `src/` folder structure
- Minimal placeholder screens

Milestone 2 adds the local demo app shell:

- Bottom tabs for Home, Collection, Crates, Journal, and Settings
- Copy detail route
- Local mock Copies, Releases, Crates, Tags, and Journal Entries
- Reusable app-shell UI components
- Dark-first, artwork-forward placeholder experience

Milestone 3 refines the Collection experience:

- Artwork-first Collection browsing
- Hybrid Copy cards with concise metadata
- Artwork-led Copy detail page
- Tasteful local animations using React Native primitives

Milestone 4 adds the SQLite foundation:

- Expo SQLite local database
- Migrations for Releases, Copies, Crates, Tags, and Journal Entries
- Demo data seeded into SQLite
- Repository/query functions under `src/db/`
- Screens read collection data from the local database layer

Milestone 5 adds the local Add Copy flow:

- Add Copy entry point from Collection
- Custom/unlinked Copy creation in SQLite
- Required title, artist, and media type
- Optional condition, rating, Tags, Crates, and initial Journal note
- Save navigates directly to the new Copy detail

Milestone 6 adds the local Edit Copy flow:

- Edit Copy entry point from Copy Detail
- Local updates for Copy overrides, media type, condition, rating, Tags, and Crates
- Save returns to Copy Detail with refreshed SQLite values

Milestone 7 adds local Crate creation and editing:

- New Crate entry point from Crates
- Crate Detail with Edit Crate entry point
- Local updates for Crate name, description, cover behavior, and Copy membership
- Save returns to Crate Detail with refreshed SQLite values

Milestone 8 adds local Tag creation and editing:

- Tags management entry point from Settings
- Local Tag creation, editing, preset colors, and safe deletion
- Add Copy and Edit Copy refresh local Tags after returning from management
- Existing Copy/Tag relationships remain intact when Tag names or colors change

Supabase, Discogs, authentication, sync, image upload, and cloud product features are intentionally deferred to later milestones.

---

# Core Documents

Start here:

- `PRODUCT_BIBLE.md`
- `docs/glossary.md`
- `docs/product-requirements.md`
- `docs/ux/core-experiences.md`
- `docs/database.md`
- `docs/architecture.md`
- `docs/setup.md`
- `docs/future-features.md`

---

# Current Stack Direction

- React Native
- Expo SDK 54
- TypeScript
- Expo Router
- React Native `StyleSheet` and design tokens
- SQLite
- Supabase
- Discogs API

---

# Local Development

Install dependencies:

```bash
pnpm install
```

Start the Expo development server:

```bash
pnpm start
```

The project is pinned to Expo SDK 54 because Expo's current App Store Expo Go release supports SDK 54. Defer newer Expo SDK upgrades until App Store Expo Go supports them on physical iPhones.

Run on iOS:

```bash
pnpm ios
```

Run on Android:

```bash
pnpm android
```

Run on web:

```bash
pnpm web
```

Run checks:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm format
```

Apply formatting:

```bash
pnpm format:write
```

---

# Development Philosophy

Documentation drives implementation.

Codex should read the product and architecture documents before making code changes.

The app should be built in small, reviewable milestones.
