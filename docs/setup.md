# Setup Guide

**Version:** 0.1.0
**Status:** Draft
**Owner:** Cody Hart
**Last Updated:** 2026-07-06

---

# Purpose

This document explains how to prepare the Crates development environment and external services.

It separates:

- What must be configured manually by the project owner
- What Codex should configure inside the repository
- What should be deferred until later milestones

---

# Local Development Requirements

Install the following before scaffolding the app:

- Node.js LTS
- npm, pnpm, or yarn
- Git
- VS Code
- Xcode
- iOS Simulator
- Expo Go app on a physical device, optional but recommended

Recommended package manager:

```text
pnpm
```

---

# Repository Setup

Expected initial repository structure:

```text
crates/
├── CHANGELOG.md
├── PRODUCT_BIBLE.md
├── README.md
├── docs/
│   ├── glossary.md
│   ├── product-requirements.md
│   ├── future-features.md
│   ├── database.md
│   ├── architecture.md
│   ├── setup.md
│   └── ux/
│       └── core-experiences.md
├── design/
├── planning/
├── supabase/
└── .github/
```

`README.md` may remain minimal until the app scaffold exists.

---

# Environment Variables

Create a local `.env` file after the Expo app is scaffolded.

Do not commit `.env`.

Expected variables:

```text
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

DISCOGS_CONSUMER_KEY=
DISCOGS_CONSUMER_SECRET=
DISCOGS_CALLBACK_URL=
```

Notes:

- `EXPO_PUBLIC_*` variables are exposed to the mobile app.
- Do not place private server secrets in `EXPO_PUBLIC_*` variables.
- Discogs secrets may need to be handled through Supabase Edge Functions instead of directly in the app.

---

# Supabase Setup

Supabase will provide:

- Authentication
- Cloud database
- Row-level security
- Edge Functions
- Future subscription support hooks

## Manual Steps

1. Create a Supabase account.
2. Create a new Supabase project.
3. Save the project URL.
4. Save the anon public key.
5. Add both values to `.env`.
6. Do not configure production auth providers until the authentication milestone.

## Deferred Supabase Work

These should happen later:

- Database migrations
- Row-level security policies
- Edge Functions
- Apple Sign-In
- Google Sign-In
- Production email templates
- Storage buckets
- Subscription-related tables

---

# Discogs Setup

Discogs will provide release metadata and optional user collection sync.

## Manual Steps

1. Create or log into a Discogs account.
2. Create a Discogs developer application.
3. Save the consumer key.
4. Save the consumer secret.
5. Define a callback URL once the auth flow is implemented.
6. Add local development values to `.env`.

## MVP Discogs Features

- Search releases
- Fetch release details
- Add release metadata to Crates
- Import a connected user's Discogs collection
- Basic add/remove sync with a connected Discogs collection

## Deferred Discogs Features

- Full field-level sync
- Marketplace integration
- Pricing history
- Advanced wantlist support
- Deep social/profile integration

---

# Authentication Setup

MVP authentication methods:

- Email/password
- Apple Sign-In
- Google Sign-In

## Manual Setup Later

Apple and Google auth require external configuration.

These should be handled during the authentication milestone, not before initial scaffold.

Expected future setup:

- Apple Developer account
- iOS bundle identifier
- App Store Connect app record
- Google OAuth client
- Supabase provider configuration
- Redirect URL configuration

For initial development, email/password auth is sufficient.

---

# Expo Setup

Codex should scaffold the Expo app.

Expected stack:

- Expo SDK 54
- React Native
- TypeScript
- Expo Router
- React Native `StyleSheet` and design tokens
- Jest
- React Native Testing Library
- ESLint
- Prettier

The app is pinned to Expo SDK 54 for Milestone 1 because the current App Store Expo Go release supports SDK 54. Defer newer Expo SDK upgrades until App Store Expo Go supports them on physical iPhones.

Use the standard Expo start commands for local development. Offline Expo startup is deferred unless it is revalidated against the pinned SDK.

## Manual Steps

Before Codex scaffolds:

1. Confirm the repository is clean.
2. Confirm current docs are committed.
3. Confirm Node.js is installed.
4. Confirm Xcode and iOS Simulator are available.

---

# What Codex Should Configure

Codex may configure:

- Expo app scaffold
- TypeScript
- Expo Router
- React Native `StyleSheet` and design tokens
- ESLint
- Prettier
- Jest
- React Native Testing Library
- Folder structure
- Initial placeholder screens
- Environment variable loading
- Supabase client wrapper
- Basic test commands

Codex should not configure production credentials.

---

# What Cody Must Configure Manually

Cody must configure:

- Supabase project
- Supabase environment variables
- Discogs developer app
- Discogs API credentials
- Apple Developer configuration
- Google OAuth configuration
- App Store Connect
- Production secrets
- Billing/subscription providers later

---

# Pre-Scaffold Checklist

Before asking Codex to scaffold the app:

- [ ] `docs/glossary.md` committed
- [ ] `PRODUCT_BIBLE.md` committed
- [ ] `docs/product-requirements.md` committed
- [ ] `docs/ux/core-experiences.md` committed
- [ ] `docs/future-features.md` committed
- [ ] `docs/database.md` committed
- [ ] `docs/architecture.md` committed
- [ ] `docs/setup.md` committed
- [ ] Repository working tree is clean
- [ ] Node.js LTS installed
- [ ] Xcode installed
- [ ] iOS Simulator available

---

# First Implementation Task

After Codex summarizes the project and the approach is approved, the first implementation task should be:

```text
Scaffold the Expo application according to docs/architecture.md and docs/setup.md.

Implement Milestone 1 only:
- Expo
- React Native
- TypeScript
- Expo Router
- React Native `StyleSheet` and design tokens
- ESLint
- Prettier
- Jest
- React Native Testing Library
- Initial folder structure
- Minimal placeholder screens

Do not implement authentication, Supabase, SQLite, Discogs, or product features yet.

After scaffolding:
- Run the available checks
- Fix any setup errors
- Update README.md with local development commands
- Summarize what changed
```

---

# Notes

This setup guide is intentionally conservative.

The goal is to create a stable foundation before implementing product features.
