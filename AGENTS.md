# AGENTS.md

# Crates AI Contributor Guide

Welcome to the Crates repository.

Before making any code changes, read the following documents in order:

1. `PRODUCT_BIBLE.md`
2. `docs/glossary.md`
3. `docs/product-requirements.md`
4. `docs/ux/core-experiences.md`
5. `docs/database.md`
6. `docs/architecture.md`
7. `docs/setup.md`
8. `docs/contributor-guide.md`

## Project Philosophy

Crates is an offline-first mobile application for people who collect physical music.

The application is copy-centric. User-owned Copies are the primary domain object.

Discogs is the primary metadata provider for the MVP, but it is not the source of truth for user data.

## Expectations

Before implementing significant changes:

- Read the documentation listed above.
- Explain your implementation plan.
- Identify unclear requirements before writing code.
- Prefer small, reviewable changes.
- Do not introduce major dependencies or architectural changes without approval.

## Implementation Priorities

1. Correctness
2. Maintainability
3. Simplicity
4. Performance
5. Premature optimization should be avoided.

## Documentation

If implementation changes architecture or product behavior, update the relevant documentation before considering the task complete.

When requirements and implementation disagree, the documentation is authoritative unless instructed otherwise.
