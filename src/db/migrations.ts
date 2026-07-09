import type * as SQLite from "expo-sqlite";

import { seedDemoData } from "@/db/seed";

const migrations = [
  {
    id: 1,
    name: "create_demo_domain_tables",
    sql: `
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS schema_migrations (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS releases (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        primary_artist_name TEXT NOT NULL,
        year INTEGER NOT NULL,
        label TEXT NOT NULL,
        format TEXT NOT NULL,
        genre TEXT NOT NULL,
        artwork_background_color TEXT NOT NULL,
        artwork_accent_color TEXT NOT NULL,
        artwork_initials TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS copies (
        id TEXT PRIMARY KEY,
        release_id TEXT,
        media_type TEXT NOT NULL DEFAULT 'Vinyl',
        title_override TEXT,
        artist_override TEXT,
        year_override INTEGER,
        condition TEXT NOT NULL,
        condition_media TEXT,
        condition_sleeve TEXT,
        rating INTEGER NOT NULL,
        acquired_from TEXT NOT NULL,
        acquired_at TEXT NOT NULL,
        personal_note TEXT NOT NULL,
        last_played_at TEXT NOT NULL,
        FOREIGN KEY (release_id) REFERENCES releases(id)
      );

      CREATE TABLE IF NOT EXISTS crates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS crate_copies (
        crate_id TEXT NOT NULL,
        copy_id TEXT NOT NULL,
        position INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (crate_id, copy_id),
        FOREIGN KEY (crate_id) REFERENCES crates(id) ON DELETE CASCADE,
        FOREIGN KEY (copy_id) REFERENCES copies(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS copy_tags (
        copy_id TEXT NOT NULL,
        tag_id TEXT NOT NULL,
        PRIMARY KEY (copy_id, tag_id),
        FOREIGN KEY (copy_id) REFERENCES copies(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS journal_entries (
        id TEXT PRIMARY KEY,
        copy_id TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        date TEXT NOT NULL,
        FOREIGN KEY (copy_id) REFERENCES copies(id) ON DELETE CASCADE
      );
    `,
  },
  {
    id: 2,
    name: "support_custom_unlinked_copies",
    sql: `
      PRAGMA foreign_keys = OFF;

      CREATE TABLE IF NOT EXISTS copies_next (
        id TEXT PRIMARY KEY,
        release_id TEXT,
        media_type TEXT NOT NULL DEFAULT 'Vinyl',
        title_override TEXT,
        artist_override TEXT,
        year_override INTEGER,
        condition TEXT NOT NULL,
        condition_media TEXT,
        condition_sleeve TEXT,
        rating INTEGER NOT NULL,
        acquired_from TEXT NOT NULL,
        acquired_at TEXT NOT NULL,
        personal_note TEXT NOT NULL,
        last_played_at TEXT NOT NULL,
        FOREIGN KEY (release_id) REFERENCES releases(id)
      );

      INSERT OR REPLACE INTO copies_next (
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
        last_played_at
      )
      SELECT
        id,
        release_id,
        'Vinyl',
        NULL,
        NULL,
        NULL,
        condition,
        condition,
        NULL,
        rating,
        acquired_from,
        acquired_at,
        personal_note,
        last_played_at
      FROM copies;

      DROP TABLE copies;
      ALTER TABLE copies_next RENAME TO copies;

      PRAGMA foreign_keys = ON;
    `,
  },
  {
    id: 3,
    name: "add_crate_cover_behavior",
    sql: `
      ALTER TABLE crates ADD COLUMN cover_behavior TEXT NOT NULL DEFAULT 'auto';
    `,
  },
] as const;

export async function runMigrations(database: SQLite.SQLiteDatabase) {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  for (const migration of migrations) {
    const applied = await database.getFirstAsync<{ id: number }>(
      "SELECT id FROM schema_migrations WHERE id = ?",
      migration.id,
    );

    if (applied) {
      continue;
    }

    await database.execAsync("PRAGMA foreign_keys = OFF");

    try {
      await database.withTransactionAsync(async () => {
        await database.execAsync(migration.sql);
        await database.runAsync(
          "INSERT INTO schema_migrations (id, name, applied_at) VALUES (?, ?, ?)",
          migration.id,
          migration.name,
          new Date().toISOString(),
        );
      });
    } finally {
      await database.execAsync("PRAGMA foreign_keys = ON");
    }
  }

  await seedDemoData(database);
}
