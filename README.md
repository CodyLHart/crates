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

Supabase, Discogs, authentication, sync, record creation/editing, and cloud product features are intentionally deferred to later milestones.

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
