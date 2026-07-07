# Product Requirements

**Version:** 0.1.0
**Status:** Draft
**Owner:** Cody Hart
**Last Updated:** 2026-07-06

---

# 1. Executive Summary

## Overview

Crates is an offline-first mobile application for people who collect physical music.

It is designed to help users organize, explore, and rediscover their collections while capturing the personal stories that make physical media meaningful.

Crates begins as a vinyl-first experience but is architected to support additional physical music formats—including CDs and cassettes—as the product evolves.

Rather than competing with Discogs as the world's best music database, Crates builds on Discogs' metadata to create a richer ownership experience centered around the user's personal collection.

---

## Product Vision

The experience of owning physical music is fundamentally different from streaming.

Physical collections represent years of discovery, memories, relationships, and personal identity.

Crates exists to become the home for that experience.

The application should feel less like inventory software and more like spending time with your collection.

---

## The Core Problem

Existing collection management applications excel at storing metadata but provide little support for building an ongoing relationship with a collection.

Streaming platforms provide excellent discovery but have no understanding of physical ownership.

Collectors deserve software that helps them reconnect with the music they already own.

---

## Product Goals

Crates should help users:

- Build and maintain their collection.
- Organize their collection in meaningful ways.
- Capture the stories behind their music.
- Rediscover forgotten favorites.
- Spend more time listening and less time managing.

Every feature should reinforce at least one of these goals.

---

# 2. MVP Success Criteria

Version 1.0 is considered successful if a user can:

- Create an account.
- Build a personal collection.
- Import a collection from Discogs.
- Add items manually through search.
- Add items by barcode scanning.
- Browse their collection in a beautiful, intuitive interface.
- Search and filter their collection.
- Create and manage custom Crates.
- Write Journal entries for their collection.
- Browse artists represented in their collection.
- Synchronize their collection across devices.
- Continue using the application while offline.

The MVP intentionally focuses on making everyday interaction with a collection significantly more enjoyable than existing alternatives.

### Discogs Integration Scope

For the MVP, Discogs integration is focused on helping users populate and maintain their Crates collection.

Required:

- Search Discogs releases
- Import one or more records from a connected Discogs collection

Deferred until after the initial MVP:

- Continuous two-way synchronization
- Full synchronization of every Discogs field
- Marketplace functionality
- Wantlist synchronization
- Advanced collection management features

---

# 3. Product Hypothesis

We believe that collectors want more than a database.

If we create a beautiful, fast, offline-first application that helps users organize, remember, and rediscover the music they already own, then collectors will prefer opening Crates over traditional collection management applications.

Our success is measured by engagement with a user's own collection—not by the amount of metadata we display.

---

# 4. Product Principles

Every feature should satisfy at least one of the following principles.

## Organize

Help users organize their collection naturally and flexibly.

## Remember

Preserve the personal stories connected to physical music.

## Rediscover

Encourage users to revisit music they already own.

Features that do not strengthen one of these principles should be reconsidered.

---

# 5. MVP Success Definition

The MVP answers one question:

> **Would a collector rather use Crates than the Discogs app to interact with their own collection?**

If the answer is yes, the MVP has succeeded.

The goal is not feature parity.

The goal is a better ownership experience.

---

# 6. Non-Goals

To maintain focus, the following are explicitly **out of scope** for Version 1.0.

These are not rejected ideas—they are intentionally deferred until the core experience is exceptional.

## We are not trying to:

- Replace Discogs as the authoritative music database.
- Build a marketplace for buying or selling music.
- Create a social network or activity feed.
- Implement messaging, comments, or follower systems.
- Support every physical media format on day one.
- Build advanced DJ preparation tools.
- Implement AI-powered recommendations or assistants.
- Track collection value or pricing history.
- Become a streaming platform.
- Build a desktop or web application before the mobile experience is mature.

Future versions may include some of these capabilities, but they must never compromise the simplicity and quality of the core product experience.

---

# Guiding Principle

When evaluating new ideas, ask:

> **Does this make it easier—or more enjoyable—for someone to reconnect with the music they physically own?**

If the answer is no, it probably doesn't belong in the current version of Crates.
