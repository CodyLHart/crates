# Contributor Guide

**Version:** 0.1.0
**Status:** Draft
**Owner:** Cody Hart
**Last Updated:** 2026-07-06

---

# Purpose

This document explains how contributors should work on Crates.

Its goal is to ensure that every change—whether made by a human or an AI coding assistant—is consistent with the project's philosophy, architecture, and engineering standards.

---

# Read Before Writing Code

Before implementing any feature, read the following documents in order:

1. `PRODUCT_BIBLE.md`
2. `docs/glossary.md`
3. `docs/product-requirements.md`
4. `docs/ux/core-experiences.md`
5. `docs/database.md`
6. `docs/architecture.md`
7. `docs/future-features.md` (for awareness only)

If any of these documents conflict, stop and ask for clarification before writing code.

---

# Core Principles

Every contribution should:

- Improve the product without increasing unnecessary complexity.
- Follow the vocabulary defined in `docs/glossary.md`.
- Respect the product philosophy defined in `PRODUCT_BIBLE.md`.
- Follow the technical architecture.
- Prefer maintainability over cleverness.

---

# Development Philosophy

Build the smallest complete solution.

Avoid premature optimization.

Avoid unnecessary abstractions.

Write code that is easy to understand six months later.

Every feature should be implemented in small, reviewable steps.

---

# Product First

Implementation should support the product—not redefine it.

Do not invent requirements.

Do not add features because they seem useful.

If a requirement is missing or ambiguous, ask before implementing.

---

# Architecture Rules

Contributors should not:

- Replace major technologies without discussion.
- Introduce large dependencies without approval.
- Bypass the offline-first architecture.
- Couple the UI directly to Discogs responses.
- Create data models that prevent future support for custom releases.

---

# Code Quality

Code should:

- Be readable.
- Be consistent.
- Use TypeScript effectively.
- Prefer composition over inheritance.
- Avoid duplication.
- Favor explicitness over magic.

Leave the codebase better than you found it.

---

# Testing

Business logic should include tests.

Critical sync behavior should be tested.

Data normalization should be tested.

Avoid snapshot tests unless they provide meaningful value.

---

# Documentation

When making significant architectural or product changes:

- Update the relevant documentation.
- Do not allow documentation to drift from implementation.
- Prefer updating an existing document over creating a new one.

---

# Git

Prefer small commits.

Each commit should represent a meaningful unit of work.

Recommended commit prefixes:

- docs:
- feat:
- fix:
- refactor:
- test:
- chore:

---

# Pull Requests

Every pull request should answer:

1. What changed?
2. Why did it change?
3. How was it tested?
4. Does any documentation need updating?

---

# AI Coding Assistants

AI assistants should:

- Read project documentation before making changes.
- Explain their implementation approach before large features.
- Avoid assumptions about product behavior.
- Ask clarifying questions when requirements are unclear.
- Prefer incremental changes over large rewrites.
- Run available tests after making changes.
- Summarize all modifications before completing a task.

---

# Definition of Done

A task is complete when:

- Requirements are satisfied.
- Code follows project architecture.
- Tests pass.
- Documentation is updated if necessary.
- No obvious cleanup remains.
- The implementation would be understandable to a new contributor.

---

# Guiding Principle

Every contribution should move Crates toward its mission:

> **Help people build a deeper relationship with the music they physically own.**
