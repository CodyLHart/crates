# Database Design

**Version:** 0.1.0
**Status:** Draft
**Owner:** Cody Hart
**Last Updated:** 2026-07-06

---

# Purpose

This document defines the core data model for Crates.

The database should support:

- User-owned physical music collections
- Offline-first usage
- Discogs-linked releases
- User-created custom releases
- Journals
- Crates
- Tags
- Future support for additional metadata providers, subscriptions, AI insights, and non-vinyl physical media

---

# Core Principle

Crates is copy-centric.

A user does not merely own a release.

A user owns a specific physical Copy.

The Copy is the center of the product experience.

---

# Domain Model

```text
User
│
├── Copies
│   ├── Release optional
│   ├── Journal Entries
│   ├── Listening Events
│   ├── Tags
│   ├── Crate Memberships
│   ├── Condition
│   ├── Rating
│   └── Purchase Information
│
├── Crates
├── Tags
├── User Settings
└── Provider Connections

Release
│
├── Tracks
├── Artists
├── Labels
├── Genres
├── Styles
└── Artwork
```

---

# Major Decisions

## Collection is conceptual, not a table

For MVP, each user has one collection.

A user's collection is represented by all Copies belonging to that user.

If future versions support multiple collections per user, a `collections` table can be introduced later.

---

## Copy is the primary ownership object

A Copy represents one physical item owned by a user.

A user may own multiple Copies of the same Release.

Examples:

- A sealed copy
- A DJ copy
- A damaged duplicate
- A cassette version
- A CD version

---

## Release is metadata

A Release describes published music metadata.

A Release may come from:

- Discogs
- Another provider in the future
- User-created custom data

A Copy may reference a Release, but it does not have to.

This allows Crates to support independent releases, test pressings, bootlegs, demos, and other items that may not exist in Discogs.

---

## Discogs is a provider, not the source of truth

Discogs is the primary metadata provider for MVP.

However, Crates should not depend on Discogs for every piece of user collection data.

User-generated content belongs to Crates.

This includes:

- Copies
- Journals
- Tags
- Crates
- Ratings
- Listening history
- Purchase information

---

## Crates contain Copies

Crates should contain Copies, not Releases.

This allows a user to place one physical copy of a release into a Crate without affecting duplicate copies.

---

## Journal Entries belong to Copies

Each Copy has its own Journal.

The Journal may include:

- Notes
- Memories
- Ratings
- Purchase events
- Listening events surfaced in timeline views
- Future AI insights
- Future photos
- Future voice memos

The Journal is a product concept.

It does not require a separate `journals` table for MVP.

Instead, Journal Entries can belong directly to Copies.

---

## Listening Events are separate from Journal Entries

Listening Events may become high-volume data.

They should be stored separately from Journal Entries for performance and querying.

Timeline views may merge Journal Entries and Listening Events in the UI.

---

# Proposed Tables

## users

Managed primarily by Supabase Auth.

Application-specific user data should live in `profiles`.

---

## profiles

Stores public and private user profile metadata needed by Crates.

Fields may include:

- id
- display_name
- avatar_url
- created_at
- updated_at

---

## provider_connections

Stores connected external services.

Examples:

- Discogs
- Future metadata providers

Fields may include:

- id
- user_id
- provider
- provider_user_id
- access_token_encrypted
- refresh_token_encrypted
- connected_at
- last_synced_at
- created_at
- updated_at

---

## releases

Stores metadata for music releases.

Fields may include:

- id
- provider
- provider_release_id
- title
- year
- country
- format
- media_type
- primary_artist_name
- artwork_url
- metadata_json
- is_custom
- created_by_user_id
- created_at
- updated_at

Notes:

- `provider` may be `discogs`, `custom`, or future providers.
- `metadata_json` stores provider-specific metadata that does not need first-class columns yet.
- Custom releases should be supported architecturally from the beginning.

---

## artists

Stores artist metadata.

Fields may include:

- id
- provider
- provider_artist_id
- name
- image_url
- metadata_json
- created_at
- updated_at

---

## release_artists

Join table between Releases and Artists.

Fields may include:

- release_id
- artist_id
- role
- position

---

## tracks

Stores tracks belonging to a Release.

Fields may include:

- id
- release_id
- position
- title
- duration
- provider_track_id
- metadata_json
- created_at
- updated_at

Notes:

Tracks belong to Releases.

Tracks are not shared between Releases.

---

## copies

Stores user-owned physical items.

Fields may include:

- id
- user_id
- release_id nullable
- media_type
- title_override
- artist_override
- year_override
- artwork_url_override
- condition_media
- condition_sleeve
- rating
- purchase_date
- purchase_location
- purchase_price
- currency
- notes_summary
- acquired_at
- created_at
- updated_at
- deleted_at
- sync_status

Notes:

- `release_id` is nullable to support custom or unlinked Copies.
- Override fields allow a Copy to exist before or without external metadata.
- `deleted_at` supports soft deletion and sync conflict handling.

---

## crates

Stores user-created groupings of Copies.

Fields may include:

- id
- user_id
- name
- description
- cover_image_url
- sort_order
- created_at
- updated_at
- deleted_at

---

## crate_copies

Join table between Crates and Copies.

Fields may include:

- crate_id
- copy_id
- added_at
- sort_order

---

## tags

Stores user-created tags.

Fields may include:

- id
- user_id
- name
- color
- created_at
- updated_at
- deleted_at

---

## copy_tags

Join table between Copies and Tags.

Fields may include:

- copy_id
- tag_id
- created_at

---

## journal_entries

Stores user-created Journal entries.

Fields may include:

- id
- user_id
- copy_id
- track_id nullable
- entry_type
- title
- body
- rating_value nullable
- occurred_at
- created_at
- updated_at
- deleted_at
- metadata_json

Entry types may include:

- note
- memory
- rating
- purchase
- maintenance
- future_ai_insight
- future_photo
- future_voice_memo

---

## listening_events

Stores play/listening activity.

Fields may include:

- id
- user_id
- copy_id
- track_id nullable
- listened_at
- context
- notes
- created_at
- updated_at
- deleted_at

---

## sync_queue

Local-only table for pending offline changes.

This table should exist in SQLite, not necessarily Supabase.

Fields may include:

- id
- entity_type
- entity_id
- operation
- payload_json
- created_at
- retry_count
- last_error

---

# Offline-First Strategy

Crates should use local SQLite as the primary runtime data store.

The app should read from SQLite first and synchronize with Supabase in the background.

## Local-first behavior

Users should be able to:

- Browse Copies
- Search Copies
- View Release metadata already cached locally
- Create and edit Journal Entries
- Create and edit Crates
- Add and remove Tags
- Update condition
- Update ratings
- Record Listening Events

without an internet connection.

## Sync behavior

When connectivity returns:

- Pending local changes are pushed to Supabase.
- Remote changes are pulled down.
- Conflicts are resolved according to entity-specific rules.
- External metadata may be refreshed.

---

# Conflict Strategy

MVP conflict handling should be simple.

## User-generated content

Prefer latest update based on `updated_at`.

Examples:

- Copy condition
- Rating
- Journal Entry edits
- Tags
- Crate metadata

## Append-style data

Merge rather than overwrite.

Examples:

- Listening Events
- Journal Entries
- Crate memberships

## Provider metadata

Provider metadata may be refreshed from the source provider.

User overrides should never be overwritten by provider metadata.

---

# Future Considerations

The schema should leave room for:

- Multiple collections per user
- Additional metadata providers
- Custom release editing
- Rich track metadata
- AI insights
- Subscriptions
- Public sharing
- Social features
- Attachments
- Photos
- Voice memos
- Collection valuation

These are not MVP features unless explicitly promoted into Product Requirements.

---

# Open Questions

- Should condition use separate media and sleeve values for all media types?
- Should a Copy have a display title materialized for fast search?
- Should custom releases live in `releases` or only as Copy overrides?
- Should provider metadata be periodically refreshed automatically?
- Should artwork be cached locally as files, blobs, or remote URLs?
- Should listening events appear in the Journal timeline by default?
