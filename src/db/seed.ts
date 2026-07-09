import type * as SQLite from "expo-sqlite";

import { copies, crates, journalEntries, releases, tags } from "@/constants/demoData";

export async function seedDemoData(database: SQLite.SQLiteDatabase) {
  await database.withTransactionAsync(async () => {
    for (const release of releases) {
      await database.runAsync(
        `
          INSERT OR REPLACE INTO releases (
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
          INSERT OR REPLACE INTO copies (
            id,
            release_id,
            condition,
            rating,
            acquired_from,
            acquired_at,
            personal_note,
            last_played_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        copy.id,
        copy.releaseId,
        copy.condition,
        copy.rating,
        copy.acquiredFrom,
        copy.acquiredAt,
        copy.personalNote,
        copy.lastPlayedAt,
      );
    }

    for (const crate of crates) {
      await database.runAsync(
        "INSERT OR REPLACE INTO crates (id, name, description) VALUES (?, ?, ?)",
        crate.id,
        crate.name,
        crate.description,
      );
    }

    for (const tag of tags) {
      await database.runAsync(
        "INSERT OR REPLACE INTO tags (id, name) VALUES (?, ?)",
        tag.id,
        tag.name,
      );
    }

    await database.runAsync("DELETE FROM crate_copies");
    for (const crate of crates) {
      for (const [position, copyId] of crate.copyIds.entries()) {
        await database.runAsync(
          "INSERT OR REPLACE INTO crate_copies (crate_id, copy_id, position) VALUES (?, ?, ?)",
          crate.id,
          copyId,
          position,
        );
      }
    }

    await database.runAsync("DELETE FROM copy_tags");
    for (const copy of copies) {
      for (const tagId of copy.tagIds) {
        await database.runAsync(
          "INSERT OR REPLACE INTO copy_tags (copy_id, tag_id) VALUES (?, ?)",
          copy.id,
          tagId,
        );
      }
    }

    for (const entry of journalEntries) {
      await database.runAsync(
        `
          INSERT OR REPLACE INTO journal_entries (
            id,
            copy_id,
            type,
            title,
            body,
            date
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        entry.id,
        entry.copyId,
        entry.type,
        entry.title,
        entry.body,
        entry.date,
      );
    }
  });
}
