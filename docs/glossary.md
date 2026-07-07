# Crates Glossary

**Version:** 0.1.0
**Status:** Draft
**Last Updated:** 2026-07-06

---

# Purpose

This glossary defines the language used throughout the Crates project.

Every document, GitHub Issue, pull request, and source file should use these terms consistently.

If a new concept is introduced, it should be added here before becoming part of the project's vocabulary.

---

# Core Domain Model

```text
Collection
│
├── Copies
│   ├── Journal
│   │   └── Journal Entries
│   ├── Crates
│   ├── Tags
│   ├── Condition
│   ├── Rating
│   └── Listening History
│
└── Releases
    ├── Tracks
    ├── Artists
    └── Metadata
```

This diagram represents the conceptual model of Crates.

A **Collection** is made up of **Copies** owned by a user.

Each **Copy** references a **Release**, which contains metadata shared by every copy of that release.

A Copy is where all user-generated information lives.

---

# Collection

The complete set of physical music copies owned by a user.

A Collection may contain vinyl records, CDs, cassettes, and additional physical music formats in future releases.

Collections are private by default.

---

# Copy

A single physical item owned by a user.

Examples:

- A first pressing of an album
- A worn DJ copy
- A sealed duplicate
- A cassette
- A CD

A **Copy** is the primary domain object within Crates.

Copies have their own:

- Journal
- Condition
- Rating
- Purchase information
- Listening history
- Crates
- Tags

Multiple Copies may reference the same Release.

---

# Release

The canonical metadata describing a published music release.

Examples include:

- Artist
- Album title
- Track list
- Label
- Release year
- Genres
- Styles
- Credits
- Artwork

Release data is primarily sourced from Discogs.

A Release exists independently of ownership.

---

# Artist

A musical artist associated with one or more Releases.

Artist pages aggregate Releases within a user's Collection and may eventually include additional metadata from external services.

---

# Track

An individual piece of music belonging to a Release.

Tracks may contain user-generated information independent of Release metadata.

Examples include:

- Rating
- Journal entries
- DJ notes
- Favorite status

Future versions may include:

- BPM
- Musical key
- Mood
- Energy
- Samples
- Transition suggestions

---

# Journal

The timeline of a user's relationship with a Copy.

A Journal contains Journal Entries that capture both user-created and system-generated events.

The Journal tells the story of ownership over time.

---

# Journal Entry

A single event within a Journal.

Current entry types include:

- Note
- Memory
- Rating
- Purchase
- Listening Event

Future entry types may include:

- AI Insight
- Photo
- Voice Memo
- Location
- Setlist
- Maintenance / Cleaning

Journal Entries are displayed chronologically.

---

# Memory

A Journal Entry describing a personal story or meaningful experience connected to a Copy.

Examples:

- Bought while traveling in Japan
- Gift from my father
- Played at our wedding

---

# Note

A Journal Entry intended for factual or technical information.

Examples:

- Needs cleaning
- Mono pressing sounds better
- Great transition into another record

---

# Insight

A system-generated Journal Entry.

Insights summarize patterns discovered from collection activity.

Examples:

- You haven't played this in 14 months.
- Appears in five Crates.
- One of your highest-rated jazz albums.

Insights are not part of the MVP.

---

# Rating

A user's personal evaluation of a Copy or Track.

Ratings are independent from Discogs data.

---

# Condition

The physical state of a Copy.

The MVP follows the Discogs grading scale:

- Mint (M)
- Near Mint (NM)
- Very Good Plus (VG+)
- Very Good (VG)
- Good Plus (G+)
- Good (G)
- Fair (F)
- Poor (P)

---

# Tag

A user-defined label applied to a Copy.

Examples:

- Jazz
- Instrumental
- Sample Source
- Needs Cleaning
- Favorite

Tags are fully customizable.

---

# Crate

A user-created grouping of Copies.

Crates are flexible and may represent:

- Genre
- Mood
- DJ Set
- Season
- Event
- Personal theme

A Copy may belong to any number of Crates.

Crates are **not** folders.

Removing a Copy from a Crate never removes it from the Collection.

---

# Home

The primary experience of the application.

Home surfaces meaningful information from the Collection rather than acting as a dashboard.

Examples include:

- Recently Added
- Continue Exploring
- Recently Played
- Rediscover
- Recent Journal Activity

The Home screen should evolve with the user's collection over time.

---

# Metadata

Information describing a Release that originates from external sources.

Metadata should support the experience without dominating it.

---

# Discogs

The primary metadata provider for Crates.

Discogs remains the authoritative source for Release information.

Crates extends Discogs data with user-generated content and a modern user experience.

---

# Offline First

A core design principle.

Users should be able to perform all common collection-management tasks without an internet connection.

Synchronization occurs automatically when connectivity returns.

---

# Physical Media

A category representing tangible music formats.

The MVP is optimized for vinyl while maintaining an architecture that supports additional media types in future releases.

Examples include:

- Vinyl
- CD
- Cassette
- MiniDisc

---

# Rediscovery

The central product philosophy of Crates.

Every feature should help users reconnect with music they already own.

Rediscovery is considered more important than acquisition.

---

# Ownership

The relationship between a user and a Copy.

Ownership includes the physical object as well as the memories, organization, and history associated with it.

Ownership is the core concept that differentiates Crates from streaming platforms.
