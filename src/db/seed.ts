import { copies, crates, journalEntries, releases, tags } from "@/constants/demoData";
import type { LocalDatabase } from "@/db/database";

export async function seedDemoData(database: LocalDatabase) {
  const existingCopies = await database.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) AS count FROM copies",
  );
  const shouldSeedCopyRelationships = (existingCopies?.count ?? 0) === 0;

  await database.withTransactionAsync(async () => {
    for (const release of releases) {
      await database.runAsync(
        `
          INSERT OR IGNORE INTO releases (
            id,
            title,
            primary_artist_name,
            year,
            label,
            format,
            genre,
            artwork_background_color,
            artwork_accent_color,
            artwork_initials
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        release.id,
        release.title,
        release.primaryArtistName,
        release.year,
        release.label,
        release.format,
        release.genre,
        release.artwork.backgroundColor,
        release.artwork.accentColor,
        release.artwork.initials,
      );
    }

    for (const copy of copies) {
      await database.runAsync(
        `
          INSERT OR IGNORE INTO copies (
            id,
            release_id,
            media_type,
            title_override,
            artist_override,
            year_override,
            condition,
            condition_media,
            condition_sleeve,
            rating,
            acquired_from,
            acquired_at,
            personal_note,
            last_played_at,
            created_at,
            updated_at,
            deleted_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        copy.id,
        copy.releaseId,
        copy.mediaType,
        copy.titleOverride,
        copy.artistOverride,
        copy.yearOverride,
        copy.condition,
        copy.conditionMedia,
        copy.conditionSleeve,
        copy.rating,
        copy.acquiredFrom,
        copy.acquiredAt,
        copy.personalNote,
        copy.lastPlayedAt,
        copy.createdAt,
        copy.updatedAt,
        copy.deletedAt,
      );
    }

    for (const crate of crates) {
      await database.runAsync(
        `
          INSERT OR IGNORE INTO crates (
            id,
            name,
            description,
            cover_behavior,
            created_at,
            updated_at,
            deleted_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        crate.id,
        crate.name,
        crate.description,
        crate.coverBehavior,
        crate.createdAt,
        crate.updatedAt,
        crate.deletedAt,
      );
    }

    for (const tag of tags) {
      await database.runAsync(
        `
          INSERT OR IGNORE INTO tags (
            id,
            name,
            color,
            created_at,
            updated_at,
            deleted_at
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        tag.id,
        tag.name,
        tag.color,
        tag.createdAt,
        tag.updatedAt,
        tag.deletedAt,
      );
    }

    if (shouldSeedCopyRelationships) {
      for (const crate of crates) {
        for (const [position, copyId] of crate.copyIds.entries()) {
          await database.runAsync(
            "INSERT OR IGNORE INTO crate_copies (crate_id, copy_id, position) VALUES (?, ?, ?)",
            crate.id,
            copyId,
            position,
          );
        }
      }

      for (const copy of copies) {
        for (const tagId of copy.tagIds) {
          await database.runAsync(
            "INSERT OR IGNORE INTO copy_tags (copy_id, tag_id) VALUES (?, ?)",
            copy.id,
            tagId,
          );
        }
      }

      for (const entry of journalEntries) {
        await database.runAsync(
          `
            INSERT OR IGNORE INTO journal_entries (
              id,
              copy_id,
            type,
              title,
              body,
              date,
              occurred_at,
            created_at,
            updated_at,
            deleted_at
          )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          entry.id,
          entry.copyId,
          entry.type,
          entry.title,
          entry.body,
          entry.occurredAt.slice(0, 10),
          entry.occurredAt,
          entry.createdAt,
          entry.updatedAt,
          entry.deletedAt,
        );
      }
    }
  });
}
