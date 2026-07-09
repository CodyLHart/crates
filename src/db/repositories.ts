import { initializeDatabase } from "@/db/client";
import { getDatabase } from "@/db/database";
import type {
  Copy,
  CopyWithRelease,
  Crate,
  CrateWithCopies,
  JournalEntry,
  JournalEntryWithCopy,
  Release,
  Tag,
} from "@/types/domain";

type CopyRow = {
  copy_id: string;
  release_id: string | null;
  media_type: string;
  title_override: string | null;
  artist_override: string | null;
  year_override: number | null;
  condition: string;
  condition_media: string | null;
  condition_sleeve: string | null;
  rating: number;
  acquired_from: string;
  acquired_at: string;
  personal_note: string;
  last_played_at: string;
  release_title: string | null;
  primary_artist_name: string | null;
  year: number | null;
  label: string | null;
  format: string | null;
  genre: string | null;
  artwork_background_color: string | null;
  artwork_accent_color: string | null;
  artwork_initials: string | null;
};

type CrateRow = {
  id: string;
  name: string;
  description: string;
  cover_behavior: Crate["coverBehavior"];
};

type TagRow = {
  id: string;
  name: string;
};

type JournalEntryRow = {
  id: string;
  copy_id: string;
  type: JournalEntry["type"];
  title: string;
  body: string;
  date: string;
};

export type CreateCustomCopyInput = {
  title: string;
  artist: string;
  mediaType: string;
  year?: number;
  conditionMedia?: string;
  conditionSleeve?: string;
  rating?: number;
  tagIds?: string[];
  crateIds?: string[];
  initialJournalNote?: string;
};

export type UpdateCopyInput = Omit<CreateCustomCopyInput, "initialJournalNote">;

export type SaveCrateInput = {
  name: string;
  description: string;
  coverBehavior: Crate["coverBehavior"];
  copyIds: string[];
};

const copySelectSql = `
  SELECT
    copies.id AS copy_id,
    copies.release_id,
    copies.media_type,
    copies.title_override,
    copies.artist_override,
    copies.year_override,
    copies.condition,
    copies.condition_media,
    copies.condition_sleeve,
    copies.rating,
    copies.acquired_from,
    copies.acquired_at,
    copies.personal_note,
    copies.last_played_at,
    releases.title AS release_title,
    releases.primary_artist_name,
    releases.year,
    releases.label,
    releases.format,
    releases.genre,
    releases.artwork_background_color,
    releases.artwork_accent_color,
    releases.artwork_initials
  FROM copies
  LEFT JOIN releases ON releases.id = copies.release_id
`;

export async function listCopies() {
  await initializeDatabase();
  const database = await getDatabase();
  const rows = await database.getAllAsync<CopyRow>(`
    ${copySelectSql}
    ORDER BY copies.last_played_at DESC
  `);

  return hydrateCopies(rows);
}

export async function getCopyWithRelease(copyId: string) {
  await initializeDatabase();
  const database = await getDatabase();
  const row = await database.getFirstAsync<CopyRow>(
    `
      ${copySelectSql}
      WHERE copies.id = ?
    `,
    copyId,
  );

  if (!row) {
    return undefined;
  }

  const [copy] = await hydrateCopies([row]);

  return copy;
}

export async function listCrates() {
  await initializeDatabase();
  const database = await getDatabase();
  const rows = await database.getAllAsync<CrateRow>(
    "SELECT id, name, description, cover_behavior FROM crates ORDER BY name",
  );

  return rows.map((row) => mapCrate(row, []));
}

export async function listTags() {
  await initializeDatabase();
  const database = await getDatabase();
  const rows = await database.getAllAsync<TagRow>("SELECT id, name FROM tags ORDER BY name");

  return rows.map(mapTag);
}

export async function listCratesWithCopies(): Promise<CrateWithCopies[]> {
  const [crateRows, copies] = await Promise.all([listCrates(), listCopies()]);

  return crateRows.map((crate) => ({
    crate,
    copies: copies.filter((copy) => copy.crateIds.includes(crate.id)),
  }));
}

export async function getCrateWithCopies(crateId: string): Promise<CrateWithCopies | undefined> {
  await initializeDatabase();
  const database = await getDatabase();
  const row = await database.getFirstAsync<CrateRow>(
    "SELECT id, name, description, cover_behavior FROM crates WHERE id = ?",
    crateId,
  );

  if (!row) {
    return undefined;
  }

  const crate = mapCrate(row, []);
  const copies = await listCopies();
  const crateCopies = copies.filter((copy) => copy.crateIds.includes(crate.id));

  return {
    crate: {
      ...crate,
      copyIds: crateCopies.map((copy) => copy.id),
    },
    copies: crateCopies,
  };
}

export async function createCrate(input: SaveCrateInput) {
  await initializeDatabase();
  const database = await getDatabase();
  const crateId = createLocalId("crate");

  await database.withTransactionAsync(async () => {
    await database.runAsync(
      "INSERT INTO crates (id, name, description, cover_behavior) VALUES (?, ?, ?, ?)",
      crateId,
      input.name.trim(),
      input.description.trim(),
      input.coverBehavior,
    );

    await replaceCrateCopies(crateId, input.copyIds);
  });

  return crateId;
}

export async function updateCrate(crateId: string, input: SaveCrateInput) {
  await initializeDatabase();
  const database = await getDatabase();

  await database.withTransactionAsync(async () => {
    await database.runAsync(
      "UPDATE crates SET name = ?, description = ?, cover_behavior = ? WHERE id = ?",
      input.name.trim(),
      input.description.trim(),
      input.coverBehavior,
      crateId,
    );

    await replaceCrateCopies(crateId, input.copyIds);
  });
}

export async function listRecentJournalEntries(): Promise<JournalEntryWithCopy[]> {
  await initializeDatabase();
  const database = await getDatabase();
  const rows = await database.getAllAsync<JournalEntryRow>(`
    SELECT id, copy_id, type, title, body, date
    FROM journal_entries
    ORDER BY date DESC
  `);

  const entries: JournalEntryWithCopy[] = [];

  for (const row of rows) {
    const copy = await getCopyWithRelease(row.copy_id);

    if (!copy) {
      continue;
    }

    entries.push({
      ...mapJournalEntry(row),
      copy,
    });
  }

  return entries;
}

export async function createCustomCopy(input: CreateCustomCopyInput) {
  await initializeDatabase();
  const database = await getDatabase();
  const now = new Date().toISOString();
  const copyId = createLocalId("copy");
  const note = input.initialJournalNote?.trim();
  const condition = input.conditionMedia?.trim() || "Not graded";

  await database.withTransactionAsync(async () => {
    await database.runAsync(
      `
        INSERT INTO copies (
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
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      copyId,
      null,
      input.mediaType.trim(),
      input.title.trim(),
      input.artist.trim(),
      input.year ?? null,
      condition,
      input.conditionMedia?.trim() || null,
      input.conditionSleeve?.trim() || null,
      input.rating ?? 0,
      "Added manually",
      now,
      note || "Custom Copy added locally.",
      now,
    );

    for (const [position, crateId] of (input.crateIds ?? []).entries()) {
      await database.runAsync(
        "INSERT OR REPLACE INTO crate_copies (crate_id, copy_id, position) VALUES (?, ?, ?)",
        crateId,
        copyId,
        position,
      );
    }

    for (const tagId of input.tagIds ?? []) {
      await database.runAsync(
        "INSERT OR REPLACE INTO copy_tags (copy_id, tag_id) VALUES (?, ?)",
        copyId,
        tagId,
      );
    }

    if (note) {
      await database.runAsync(
        `
          INSERT INTO journal_entries (
            id,
            copy_id,
            type,
            title,
            body,
            date
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        createLocalId("journal"),
        copyId,
        "Note",
        "Initial note",
        note,
        now,
      );
    }
  });

  return copyId;
}

export async function updateCopy(copyId: string, input: UpdateCopyInput) {
  await initializeDatabase();
  const database = await getDatabase();
  const condition = input.conditionMedia?.trim() || "Not graded";

  await database.withTransactionAsync(async () => {
    await database.runAsync(
      `
        UPDATE copies
        SET
          media_type = ?,
          title_override = ?,
          artist_override = ?,
          year_override = ?,
          condition = ?,
          condition_media = ?,
          condition_sleeve = ?,
          rating = ?
        WHERE id = ?
      `,
      input.mediaType.trim(),
      input.title.trim(),
      input.artist.trim(),
      input.year ?? null,
      condition,
      input.conditionMedia?.trim() || null,
      input.conditionSleeve?.trim() || null,
      input.rating ?? 0,
      copyId,
    );

    await database.runAsync("DELETE FROM crate_copies WHERE copy_id = ?", copyId);
    for (const [position, crateId] of (input.crateIds ?? []).entries()) {
      await database.runAsync(
        "INSERT OR REPLACE INTO crate_copies (crate_id, copy_id, position) VALUES (?, ?, ?)",
        crateId,
        copyId,
        position,
      );
    }

    await database.runAsync("DELETE FROM copy_tags WHERE copy_id = ?", copyId);
    for (const tagId of input.tagIds ?? []) {
      await database.runAsync(
        "INSERT OR REPLACE INTO copy_tags (copy_id, tag_id) VALUES (?, ?)",
        copyId,
        tagId,
      );
    }
  });
}

async function hydrateCopies(rows: CopyRow[]) {
  const copies: CopyWithRelease[] = [];

  for (const row of rows) {
    const copy = mapCopy(row);
    const crates = await listCratesForCopy(copy.id);
    const tags = await listTagsForCopy(copy.id);

    copies.push({
      ...copy,
      crateIds: crates.map((crate) => crate.id),
      tagIds: tags.map((tag) => tag.id),
      release: mapRelease(row),
      crates,
      tags,
      journalEntries: await listJournalEntriesForCopy(copy.id),
    });
  }

  return copies;
}

async function listCratesForCopy(copyId: string) {
  const database = await getDatabase();
  const rows = await database.getAllAsync<CrateRow>(
    `
      SELECT crates.id, crates.name, crates.description, crates.cover_behavior
      FROM crates
      INNER JOIN crate_copies ON crate_copies.crate_id = crates.id
      WHERE crate_copies.copy_id = ?
      ORDER BY crate_copies.position ASC
    `,
    copyId,
  );

  return rows.map((row) => mapCrate(row, [copyId]));
}

async function replaceCrateCopies(crateId: string, copyIds: string[]) {
  const database = await getDatabase();

  await database.runAsync("DELETE FROM crate_copies WHERE crate_id = ?", crateId);
  for (const [position, copyId] of copyIds.entries()) {
    await database.runAsync(
      "INSERT OR REPLACE INTO crate_copies (crate_id, copy_id, position) VALUES (?, ?, ?)",
      crateId,
      copyId,
      position,
    );
  }
}

async function listTagsForCopy(copyId: string) {
  const database = await getDatabase();
  const rows = await database.getAllAsync<TagRow>(
    `
      SELECT tags.id, tags.name
      FROM tags
      INNER JOIN copy_tags ON copy_tags.tag_id = tags.id
      WHERE copy_tags.copy_id = ?
      ORDER BY tags.name ASC
    `,
    copyId,
  );

  return rows.map(mapTag);
}

async function listJournalEntriesForCopy(copyId: string) {
  const database = await getDatabase();
  const rows = await database.getAllAsync<JournalEntryRow>(
    `
      SELECT id, copy_id, type, title, body, date
      FROM journal_entries
      WHERE copy_id = ?
      ORDER BY date DESC
    `,
    copyId,
  );

  return rows.map(mapJournalEntry);
}

function mapCopy(row: CopyRow): Copy {
  return {
    id: row.copy_id,
    releaseId: row.release_id,
    mediaType: row.media_type,
    titleOverride: row.title_override,
    artistOverride: row.artist_override,
    yearOverride: row.year_override,
    condition: row.condition,
    conditionMedia: row.condition_media,
    conditionSleeve: row.condition_sleeve,
    rating: row.rating,
    acquiredFrom: row.acquired_from,
    acquiredAt: row.acquired_at,
    personalNote: row.personal_note,
    crateIds: [],
    tagIds: [],
    lastPlayedAt: row.last_played_at,
  };
}

function mapRelease(row: CopyRow): Release {
  const title = row.title_override ?? row.release_title ?? "Untitled Copy";
  const artist = row.artist_override ?? row.primary_artist_name ?? "Unknown Artist";

  return {
    id: row.release_id ?? `custom-release-${row.copy_id}`,
    title,
    primaryArtistName: artist,
    year: row.year_override ?? row.year,
    label: row.label ?? "Custom",
    format: row.media_type || row.format || "Unknown Format",
    genre: row.genre ?? "Custom",
    artwork: {
      backgroundColor: row.artwork_background_color ?? "#4d4037",
      accentColor: row.artwork_accent_color ?? "#d29a5a",
      initials: row.artwork_initials ?? getArtworkInitials(title, artist),
    },
  };
}

function mapCrate(row: CrateRow, copyIds: string[]): Crate {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    coverBehavior: row.cover_behavior,
    copyIds,
  };
}

function mapTag(row: TagRow): Tag {
  return {
    id: row.id,
    name: row.name,
  };
}

function mapJournalEntry(row: JournalEntryRow): JournalEntry {
  return {
    id: row.id,
    copyId: row.copy_id,
    type: row.type,
    title: row.title,
    body: row.body,
    date: row.date,
  };
}

function createLocalId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function getArtworkInitials(title: string, artist: string) {
  const words = `${artist} ${title}`
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .slice(0, 2);

  return words.map((word) => word[0]?.toUpperCase()).join("") || "CR";
}
