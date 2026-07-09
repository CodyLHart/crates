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
  release_id: string;
  condition: string;
  rating: number;
  acquired_from: string;
  acquired_at: string;
  personal_note: string;
  last_played_at: string;
  release_title: string;
  primary_artist_name: string;
  year: number;
  label: string;
  format: string;
  genre: string;
  artwork_background_color: string;
  artwork_accent_color: string;
  artwork_initials: string;
};

type CrateRow = {
  id: string;
  name: string;
  description: string;
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

export async function listCopies() {
  await initializeDatabase();
  const database = await getDatabase();
  const rows = await database.getAllAsync<CopyRow>(`
    SELECT
      copies.id AS copy_id,
      copies.release_id,
      copies.condition,
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
    INNER JOIN releases ON releases.id = copies.release_id
    ORDER BY copies.last_played_at DESC
  `);

  return hydrateCopies(rows);
}

export async function getCopyWithRelease(copyId: string) {
  await initializeDatabase();
  const database = await getDatabase();
  const row = await database.getFirstAsync<CopyRow>(
    `
      SELECT
        copies.id AS copy_id,
        copies.release_id,
        copies.condition,
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
      INNER JOIN releases ON releases.id = copies.release_id
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

export async function listCratesWithCopies(): Promise<CrateWithCopies[]> {
  await initializeDatabase();
  const database = await getDatabase();
  const crateRows = await database.getAllAsync<CrateRow>(
    "SELECT id, name, description FROM crates ORDER BY name",
  );
  const copies = await listCopies();

  return crateRows.map((row) => {
    const crate = mapCrate(row, []);

    return {
      crate,
      copies: copies.filter((copy) => copy.crateIds.includes(crate.id)),
    };
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
      SELECT crates.id, crates.name, crates.description
      FROM crates
      INNER JOIN crate_copies ON crate_copies.crate_id = crates.id
      WHERE crate_copies.copy_id = ?
      ORDER BY crate_copies.position ASC
    `,
    copyId,
  );

  return rows.map((row) => mapCrate(row, [copyId]));
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
    condition: row.condition,
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
  return {
    id: row.release_id,
    title: row.release_title,
    primaryArtistName: row.primary_artist_name,
    year: row.year,
    label: row.label,
    format: row.format,
    genre: row.genre,
    artwork: {
      backgroundColor: row.artwork_background_color,
      accentColor: row.artwork_accent_color,
      initials: row.artwork_initials,
    },
  };
}

function mapCrate(row: CrateRow, copyIds: string[]): Crate {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
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
