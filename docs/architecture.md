# Technical Architecture

**Version:** 0.1.0
**Status:** Draft
**Owner:** Cody Hart
**Last Updated:** 2026-07-06

---

# Purpose

This document defines the technical architecture for Crates.

It should guide implementation decisions and prevent Codex or future contributors from making inconsistent architectural choices.

The architecture should support:

- A polished mobile app experience
- Offline-first functionality
- Multi-user accounts
- Discogs integration
- Local-first collection browsing
- Future subscriptions
- Future AI and metadata enrichment
- Future support for additional physical media formats

---

# Architecture Summary

Crates is a React Native mobile application built with Expo.

The app uses a local-first architecture:

1. The app reads and writes primarily to local SQLite.
2. Supabase provides authentication, cloud persistence, and cross-device sync.
3. Discogs provides external release metadata.
4. Local changes are queued while offline.
5. Sync pushes local changes and pulls remote updates when connectivity returns.

```text
React Native / Expo App
        │
        ├── SQLite
        │     └── Local runtime data store
        │
        ├── Supabase
        │     ├── Auth
        │     ├── Postgres
        │     └── Edge Functions
        │
        └── Discogs API
              └── Release metadata and collection sync
```

## Current Milestone Implementation

Milestone 2 uses local mock data only to validate the app shell and navigation experience.

The current runtime data source is `src/constants/demoData.ts`, which defines demo Copies, Releases, Crates, Tags, and Journal Entries. This is not persistence and should be replaced by SQLite-backed data access in a later milestone.

Supabase, Discogs, authentication, sync, and product persistence remain deferred.

Milestone 3 refines only the Collection and Copy Detail presentation. It keeps `src/constants/demoData.ts` as the data source while making browsing more artwork-first, adding concise Copy metadata, and using small React Native entrance animations for context.

Milestone 4 introduces the SQLite foundation. `src/constants/demoData.ts` now acts as seed input only; screens read through async repository functions in `src/db/`, which initialize Expo SQLite, run migrations, seed the demo Collection, and return hydrated domain objects. Supabase, Discogs, authentication, sync, and editing remain deferred.

Milestone 5 adds local custom Copy creation. The Add Copy flow writes directly to SQLite through `src/db/repositories.ts`, supports unlinked Copies with nullable `release_id` and Copy-level title/artist/year overrides, and can attach existing Tags, Crates, and an initial Journal Entry. Discogs lookup, Supabase, authentication, sync, and image upload remain deferred.

Milestone 6 adds local Copy editing. The Edit Copy flow reuses the same form surface as Add Copy, reads the selected Copy through the repository layer, updates Copy override fields and Tag/Crate memberships in SQLite, and returns to the refreshed Copy Detail screen. Discogs lookup, Supabase, authentication, sync, and image upload remain deferred.

---

# Core Technology Choices

## Mobile Framework

Use:

- React Native
- Expo
- TypeScript

Rationale:

- Expo provides a fast, reliable React Native workflow.
- TypeScript improves maintainability.
- Expo supports iOS and Android, even though iOS is the initial priority.

---

## Routing

Use:

- Expo Router

Rationale:

- File-based routing works well with Expo.
- It keeps navigation structure visible in the filesystem.
- It supports nested layouts and tabs cleanly.

---

## Styling

Use:

- React Native `StyleSheet`
- Design tokens in `src/design/`
- Custom reusable components

Rationale:

- `StyleSheet` avoids Metro/runtime styling compatibility risk during the initial Expo SDK 57 scaffold.
- Design tokens keep color, spacing, typography, and radius choices consistent without introducing styling infrastructure.
- Custom components give Crates its own visual identity.
- A full component library may make the app feel generic.

NativeWind is deferred until the Expo SDK compatibility surface is stable enough to re-evaluate.

Avoid introducing a large UI component library unless a specific need emerges.

---

## Backend

Use:

- Supabase

Rationale:

- Built-in authentication
- Postgres database
- Row-level security
- Edge Functions
- Good fit for an affordable MVP
- Scales beyond initial usage

Supabase is the cloud persistence layer, not the primary runtime data store.

---

## Local Storage

Use:

- SQLite

Rationale:

- Crates is offline-first.
- Collection browsing, search, journals, crates, and tags should work without internet.
- SQLite is reliable and well-suited for structured local data.

The app should read from SQLite by default.

---

# Data Flow

## Normal App Usage

```text
User Action
   ↓
Write to SQLite
   ↓
Mark entity as pending sync
   ↓
Update UI immediately
   ↓
Background sync pushes change to Supabase
```

The UI should not wait for the network for local actions.

---

## Remote Sync

```text
Supabase
   ↓
Pull remote changes
   ↓
Resolve conflicts
   ↓
Write to SQLite
   ↓
Update UI
```

Remote sync should be incremental whenever possible.

---

## Discogs Metadata

```text
User searches or imports
   ↓
Discogs API
   ↓
Normalize metadata
   ↓
Store Release data
   ↓
Create or update Copy
   ↓
Sync user-owned data through Supabase
```

Discogs metadata should be normalized before being used by the app.

Do not tightly couple the UI to raw Discogs API responses.

---

# Application Layers

The codebase should be organized by responsibility.

## Suggested Structure

```text
app/
  (auth)/
  (tabs)/
  copy/
  crate/
  artist/
  track/
  settings/

src/
  components/
  features/
  db/
  sync/
  services/
  hooks/
  utils/
  types/
  constants/
  design/
```

---

# Layer Responsibilities

## app/

Expo Router routes and layouts.

This layer should stay thin.

Routes should compose feature screens rather than contain business logic directly.

---

## src/components/

Reusable UI components.

Examples:

- Button
- Card
- Screen
- EmptyState
- Artwork
- Rating
- TagChip

Components should be generic and reusable.

---

## src/features/

Feature-specific UI and logic.

Examples:

```text
src/features/collection/
src/features/crates/
src/features/journal/
src/features/discogs/
src/features/auth/
```

Feature modules may contain:

- screens
- components
- hooks
- local helpers
- tests

---

## src/db/

SQLite setup, migrations, queries, and local data access.

This layer should own:

- local schema
- migrations
- query helpers
- local repositories

---

## src/sync/

Offline sync logic.

This layer should own:

- sync queue
- push changes
- pull changes
- conflict handling
- retry logic

---

## src/services/

External service clients.

Examples:

- Supabase client
- Discogs client
- future metadata providers
- future RevenueCat client

Services should not directly update UI state.

---

## src/hooks/

Shared hooks that are not feature-specific.

---

## src/types/

Shared TypeScript types.

Types should reflect domain language from `docs/glossary.md`.

---

## src/design/

Design tokens and UI constants.

Examples:

- colors
- spacing
- typography
- radii
- shadows
- motion values

---

# Authentication

Use Supabase Auth.

MVP auth methods:

- Email/password
- Apple Sign-In
- Google Sign-In

Authentication is required to use the app.

However, the app should still behave gracefully during temporary network loss after a user has an active session.

---

# Environment Variables

Secrets should never be committed.

Expected environment variables may include:

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
DISCOGS_CONSUMER_KEY
DISCOGS_CONSUMER_SECRET
```

Server-only secrets should be used through Supabase Edge Functions rather than exposed in the mobile app.

---

# Discogs Integration

Discogs should be treated as an external provider.

The app should support:

- Searching releases
- Viewing release metadata
- Adding a release to the user's collection
- Importing a user's Discogs collection
- Adding/removing releases from a connected Discogs collection for basic two-way sync

The MVP should not attempt to sync every possible Discogs field.

User-generated Crates, Tags, Journal Entries, ratings, and notes remain internal to Crates.

---

# Offline-First Requirements

The following should work offline after initial data sync:

- Browse collection
- Search local collection
- View cached release metadata
- View Copy details
- Create and edit Journal Entries
- Create and edit Crates
- Add and remove Tags
- Update condition
- Update ratings
- Record Listening Events

Network-required features should degrade gracefully.

Examples:

- Discogs search
- Discogs import
- Metadata refresh
- Account creation
- Initial login

---

# Sync Principles

## Local writes first

User actions should update SQLite immediately.

## Background sync

Network sync should happen after local state is updated.

## Conflict handling

MVP conflict resolution should remain simple:

- Latest update wins for editable user fields.
- Append-only entities should merge.
- Provider metadata can refresh.
- User overrides should never be overwritten by provider metadata.

## Soft deletes

Use soft deletes for synced user-owned entities.

This helps avoid accidental data loss and makes conflict resolution easier.

---

# Testing Strategy

The project should include tests from the beginning.

Recommended tools:

- Jest
- React Native Testing Library

Initial focus:

- Utility functions
- Data normalization
- SQLite repository behavior
- Sync queue behavior
- Critical UI components
- Authentication state handling

Codex should add tests for meaningful business logic.

---

# Accessibility Requirements

Accessibility is part of the architecture, not polish.

Interactive components should include:

- Accessible labels
- Appropriate roles
- Large touch targets
- Sufficient contrast
- Screen reader-friendly structure

The app should be usable with VoiceOver on iOS.

---

# Performance Requirements

Crates should feel fast even with large collections.

Implementation should account for:

- Thousands of Copies
- Large artwork lists
- Fast local search
- Virtualized lists
- Image caching
- Incremental sync

Avoid loading entire collections into memory unnecessarily.

---

# Error Handling

Errors should be handled intentionally.

The app should distinguish between:

- Network unavailable
- Auth expired
- Discogs unavailable
- Supabase unavailable
- Sync conflict
- Validation error
- Unknown error

User-facing messages should be calm, clear, and non-technical.

---

# Codex Rules

Codex should not make major architectural decisions without approval.

Before implementing a major feature, Codex should:

1. Read `PRODUCT_BIBLE.md`.
2. Read `docs/glossary.md`.
3. Read `docs/product-requirements.md`.
4. Read `docs/ux/core-experiences.md` if present.
5. Read this architecture document.
6. Summarize the intended approach.
7. Ask clarifying questions if requirements conflict or are incomplete.

Codex should prefer small, reviewable changes.

---

# Avoid

Do not introduce:

- Large UI component libraries without approval
- Global state managers without a clear need
- Backend frameworks outside Supabase without approval
- Raw Discogs responses in UI components
- Network-first collection browsing
- Hard dependencies on vinyl-only assumptions
- Tables or data models that prevent custom releases
- Features from `docs/future-features.md` unless promoted into active requirements

---

# Initial Implementation Milestones

## Milestone 1 — App Foundation

- Expo app
- TypeScript
- Expo Router
- React Native `StyleSheet` and design tokens
- ESLint
- Prettier
- Testing setup
- Basic folder structure

## Milestone 2 — Authentication Foundation

- Supabase client
- Auth screens
- Session handling
- Protected routes

## Milestone 3 — Local Database Foundation

- SQLite setup
- Local migrations
- Initial repositories
- Seed/demo data

## Milestone 4 — Collection Shell

- Home
- Collection
- Copy detail
- Crates
- Settings

## Milestone 5 — Discogs Foundation

- Discogs search
- Release normalization
- Add Copy from release
- Barcode search if supported

## Milestone 6 — Sync Foundation

- Sync queue
- Push local changes
- Pull remote changes
- Basic conflict handling

---

# Open Questions

- Should Supabase writes happen directly from the app or through Edge Functions for all synced entities?
- Which SQLite library should be used?
- Should we use a query/caching library on top of SQLite?
- Should local search use SQLite FTS from the beginning?
- What is the first minimal sync implementation?
- Should Discogs OAuth be handled in-app or through an Edge Function?
- How much demo data should exist during development?
