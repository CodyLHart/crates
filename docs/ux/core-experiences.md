# Core Experiences

**Version:** 0.1.0
**Status:** Draft
**Owner:** Cody Hart
**Last Updated:** 2026-07-06

---

# Purpose

This document defines the core user experiences that Crates is designed to deliver.

Unlike feature specifications, these experiences describe what users are trying to accomplish and how the product should make them feel.

Every screen, workflow, and feature should strengthen one or more of these experiences.

---

# Experience 1 — Build My Collection

## User Goal

I want to quickly build my music collection without feeling like I'm doing data entry.

## Why It Matters

The first experience with Crates determines whether a new user continues using it.

Adding music should feel satisfying, fast, and rewarding.

## MVP Entry Points

- Connect a Discogs account and import an existing collection.
- Search for a release and add it manually.
- Scan a barcode to identify and add a release.

## Future Entry Points

- Scan album artwork.
- Create a fully custom release not found in external databases.
- Import from additional music services.

## Success Criteria

- A new user can add their first Copy in under one minute.
- Importing large collections feels fast and reliable.
- Metadata is automatically populated whenever possible.
- Manual entry remains simple when automatic metadata is unavailable.

## Design Principles

- Minimize taps.
- Prioritize artwork.
- Reduce typing whenever possible.
- Ask only for information that provides immediate value.

---

# Experience 2 — Explore My Collection

## User Goal

I want browsing my collection to be enjoyable, even when I'm not looking for anything specific.

## Why It Matters

Collectors often browse before they decide what to listen to.

Exploration should feel inspiring rather than transactional.

## Success Criteria

- Browsing feels smooth and visually engaging.
- Album artwork is emphasized.
- Search feels instantaneous.
- Metadata supports exploration without overwhelming the interface.

## Design Principles

- Artwork first.
- Progressive disclosure.
- Comfortable scrolling.
- Beautiful typography.
- Fast interactions.

---

# Experience 3 — Organize My Collection

## User Goal

I want to organize my collection the way I think about music.

## Why It Matters

Every collector has a unique organizational style.

Crates should adapt to users instead of forcing a single organizational model.

## Primary Organization Tools

- Crates
- Tags
- Search
- Filters

## Success Criteria

- Copies can belong to multiple Crates.
- Users rarely need to reorganize because multiple organizational approaches can coexist.
- Organization remains flexible as collections grow.

## Design Principles

- Never force a hierarchy.
- Support multiple organizational styles simultaneously.
- Keep organization effortless.

---

# Experience 4 — Journal My Collection

## User Goal

I want to preserve my relationship with the music I own.

## Why It Matters

Metadata can be found anywhere.

Personal history cannot.

The Journal transforms a collection into a living story.

## MVP Journal Entries

- Notes
- Memories
- Ratings
- Purchase Events
- Listening Events

## Future Journal Entries

- Photos
- Voice Memos
- AI Insights
- Cleaning & Maintenance
- Setlists

## Success Criteria

- Adding a Journal entry is frictionless.
- Users naturally revisit older Journal entries.
- The Journal becomes more valuable over time.

## Design Principles

- Timeline-first.
- Personal over technical.
- Encourage reflection without requiring it.

---

# Experience 5 — Rediscover My Collection

## User Goal

Help me reconnect with music I already own.

## Why It Matters

Rediscovery is the emotional payoff of collecting.

The best record to listen to next is often one you've forgotten about.

## MVP Home Experience

Surface meaningful moments from the collection, including:

- Recently Added
- Recently Played
- Recently Journaled
- Recent Crate Activity

## Future Experiences

- Forgotten Favorites
- Seasonal Suggestions
- Smart Crates
- AI Recommendations
- Listening Trends

## Success Criteria

- Users regularly revisit music they haven't listened to in a long time.
- Home evolves naturally as the collection grows.
- The app encourages listening rather than passive browsing.

## Design Principles

- Surprise thoughtfully.
- Celebrate ownership.
- Encourage curiosity.
- Never interrupt.

---

# Shared Design Principles

Every core experience should:

- Feel fast.
- Work offline whenever practical.
- Minimize unnecessary effort.
- Prioritize beautiful presentation.
- Reduce cognitive load.
- Scale gracefully from a handful of items to thousands.
- Support both casual collectors and power users without overwhelming either.

---

# Success Definition

Crates succeeds when interacting with a personal music collection becomes as enjoyable as listening to the music itself.

Every experience should reinforce one or more of the product's three pillars:

- **Organize**
- **Remember**
- **Rediscover**
