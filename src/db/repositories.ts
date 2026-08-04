import { initializeDatabase } from "@/db/client";
import { getDatabase } from "@/db/database";
import type {
  Copy,
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
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
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
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type TagRow = {
  id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type JournalEntryRow = {
  id: string;
  copy_id: string;
  type: JournalEntry["type"];
  title: string;
  body: string;
  date: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
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

export type SaveTagInput = {
  name: string;
  color: string;
};

export type CollectionSortMode =
  "recently_added" | "title_asc" | "artist_asc" | "year_desc" | "year_asc" | "rating_desc";

export type CollectionLinkageFilter = "all" | "linked" | "unlinked";

export type CollectionFilters = {
  mediaTypes?: string[];
  conditionMedia?: string[];
  conditionSleeve?: string[];
  ratings?: number[];
  tagIds?: string[];
  crateIds?: string[];
  linkage?: CollectionLinkageFilter;
};

export type CollectionQuery = {
  search?: string;
  filters?: CollectionFilters;
  sort?: CollectionSortMode;
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
    copies.created_at,
    copies.updated_at,
    copies.deleted_at,
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
    WHERE copies.deleted_at IS NULL
    ORDER BY copies.last_played_at DESC
  `);

  return hydrateCopies(rows);
}

export async function listCollectionCopies(query: CollectionQuery = {}) {
  await initializeDatabase();
  const database = await getDatabase();
  const { whereSql, params } = buildCollectionWhere(query);
  const orderSql = getCollectionOrderSql(query.sort ?? "recently_added");
  const rows = await database.getAllAsync<CopyRow>(
    `
    ${copySelectSql}
    ${whereSql}
    ${orderSql}
  `,
    ...params,
  );

  return hydrateCopies(rows);
}

export async function getCopyWithRelease(copyId: string) {
  await initializeDatabase();
  const database = await getDatabase();
  const row = await database.getFirstAsync<CopyRow>(
    `
      ${copySelectSql}
      WHERE copies.id = ?
        AND copies.deleted_at IS NULL
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
    `
      SELECT id, name, description, cover_behavior, created_at, updated_at, deleted_at
      FROM crates
      WHERE deleted_at IS NULL
      ORDER BY name
    `,
  );

  return rows.map((row) => mapCrate(row, []));
}

export async function listTags() {
  await initializeDatabase();
  const database = await getDatabase();
  const rows = await database.getAllAsync<TagRow>(`
    SELECT id, name, color, created_at, updated_at, deleted_at
    FROM tags
    WHERE deleted_at IS NULL
    ORDER BY name
  `);

  return rows.map(mapTag);
}

export async function createTag(input: SaveTagInput) {
  await initializeDatabase();
  const database = await getDatabase();
  const tagId = createLocalId("tag");
  const now = new Date().toISOString();

  await database.runAsync(
    "INSERT INTO tags (id, name, color, created_at, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?)",
    tagId,
    input.name.trim(),
    input.color,
    now,
    now,
    null,
  );

  return tagId;
}

export async function updateTag(tagId: string, input: SaveTagInput) {
  await initializeDatabase();
  const database = await getDatabase();
  const now = new Date().toISOString();

  await database.runAsync(
    "UPDATE tags SET name = ?, color = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL",
    input.name.trim(),
    input.color,
    now,
    tagId,
  );
}

export async function deleteTag(tagId: string) {
  await initializeDatabase();
  const database = await getDatabase();

  await database.runAsync("DELETE FROM tags WHERE id = ?", tagId);
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
    `
      SELECT id, name, description, cover_behavior, created_at, updated_at, deleted_at
      FROM crates
      WHERE id = ?
        AND deleted_at IS NULL
    `,
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
  const now = new Date().toISOString();

  await database.withTransactionAsync(async () => {
    await database.runAsync(
      `
        INSERT INTO crates (
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
      crateId,
      input.name.trim(),
      input.description.trim(),
      input.coverBehavior,
      now,
      now,
      null,
    );

    await replaceCrateCopies(crateId, input.copyIds);
  });

  return crateId;
}

export async function updateCrate(crateId: string, input: SaveCrateInput) {
  await initializeDatabase();
  const database = await getDatabase();
  const now = new Date().toISOString();

  await database.withTransactionAsync(async () => {
    await database.runAsync(
      `
        UPDATE crates
        SET name = ?, description = ?, cover_behavior = ?, updated_at = ?
        WHERE id = ?
          AND deleted_at IS NULL
      `,
      input.name.trim(),
      input.description.trim(),
      input.coverBehavior,
      now,
      crateId,
    );

    await replaceCrateCopies(crateId, input.copyIds);
  });
}

export async function listRecentJournalEntries(): Promise<JournalEntryWithCopy[]> {
  await initializeDatabase();
  const database = await getDatabase();
  const rows = await database.getAllAsync<JournalEntryRow>(`
    SELECT id, copy_id, type, title, body, date, created_at, updated_at, deleted_at
    FROM journal_entries
    WHERE deleted_at IS NULL
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
          last_played_at,
          created_at,
          updated_at,
          deleted_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      now,
      now,
      null,
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
            date,
            created_at,
            updated_at,
            deleted_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        createLocalId("journal"),
        copyId,
        "note",
        "Initial note",
        note,
        now,
        now,
        now,
        null,
      );
    }
  });

  return copyId;
}

export async function updateCopy(copyId: string, input: UpdateCopyInput) {
  await initializeDatabase();
  const database = await getDatabase();
  const now = new Date().toISOString();
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
          rating = ?,
          updated_at = ?
        WHERE id = ?
          AND deleted_at IS NULL
      `,
      input.mediaType.trim(),
      input.title.trim(),
      input.artist.trim(),
      input.year ?? null,
      condition,
      input.conditionMedia?.trim() || null,
      input.conditionSleeve?.trim() || null,
      input.rating ?? 0,
      now,
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
  if (!rows.length) {
    return [];
  }

  const copyIds = rows.map((row) => row.copy_id);
  const [cratesByCopyId, tagsByCopyId, journalEntriesByCopyId] = await Promise.all([
    listCratesForCopies(copyIds),
    listTagsForCopies(copyIds),
    listJournalEntriesForCopies(copyIds),
  ]);

  return rows.map((row) => {
    const copy = mapCopy(row);
    const crates = cratesByCopyId.get(copy.id) ?? [];
    const tags = tagsByCopyId.get(copy.id) ?? [];

    return {
      ...copy,
      crateIds: crates.map((crate) => crate.id),
      tagIds: tags.map((tag) => tag.id),
      release: mapRelease(row),
      crates,
      tags,
      journalEntries: journalEntriesByCopyId.get(copy.id) ?? [],
    };
  });
}

async function listCratesForCopies(copyIds: string[]) {
  const cratesByCopyId = new Map<string, Crate[]>();

  if (!copyIds.length) {
    return cratesByCopyId;
  }

  const database = await getDatabase();
  const placeholders = getPlaceholders(copyIds);
  const rows = await database.getAllAsync<CrateRow>(
    `
      SELECT crates.id, crates.name, crates.description, crates.cover_behavior, crate_copies.copy_id
        , crates.created_at, crates.updated_at, crates.deleted_at
      FROM crates
      INNER JOIN crate_copies ON crate_copies.crate_id = crates.id
      WHERE crate_copies.copy_id IN (${placeholders})
        AND crates.deleted_at IS NULL
      ORDER BY crate_copies.copy_id ASC, crate_copies.position ASC
    `,
    ...copyIds,
  );

  rows.forEach((row) => {
    const copyId = String((row as CrateRow & { copy_id: string }).copy_id);
    const crates = cratesByCopyId.get(copyId) ?? [];

    crates.push(mapCrate(row, [copyId]));
    cratesByCopyId.set(copyId, crates);
  });

  return cratesByCopyId;
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

async function listTagsForCopies(copyIds: string[]) {
  const tagsByCopyId = new Map<string, Tag[]>();

  if (!copyIds.length) {
    return tagsByCopyId;
  }

  const database = await getDatabase();
  const placeholders = getPlaceholders(copyIds);
  const rows = await database.getAllAsync<TagRow>(
    `
      SELECT tags.id, tags.name, tags.color, copy_tags.copy_id
        , tags.created_at, tags.updated_at, tags.deleted_at
      FROM tags
      INNER JOIN copy_tags ON copy_tags.tag_id = tags.id
      WHERE copy_tags.copy_id IN (${placeholders})
        AND tags.deleted_at IS NULL
      ORDER BY copy_tags.copy_id ASC, tags.name ASC
    `,
    ...copyIds,
  );

  rows.forEach((row) => {
    const copyId = String((row as TagRow & { copy_id: string }).copy_id);
    const tags = tagsByCopyId.get(copyId) ?? [];

    tags.push(mapTag(row));
    tagsByCopyId.set(copyId, tags);
  });

  return tagsByCopyId;
}

async function listJournalEntriesForCopies(copyIds: string[]) {
  const entriesByCopyId = new Map<string, JournalEntry[]>();

  if (!copyIds.length) {
    return entriesByCopyId;
  }

  const database = await getDatabase();
  const placeholders = getPlaceholders(copyIds);
  const rows = await database.getAllAsync<JournalEntryRow>(
    `
      SELECT id, copy_id, type, title, body, date, created_at, updated_at, deleted_at
      FROM journal_entries
      WHERE copy_id IN (${placeholders})
        AND deleted_at IS NULL
      ORDER BY copy_id ASC, date DESC
    `,
    ...copyIds,
  );

  rows.forEach((row) => {
    const entries = entriesByCopyId.get(row.copy_id) ?? [];

    entries.push(mapJournalEntry(row));
    entriesByCopyId.set(row.copy_id, entries);
  });

  return entriesByCopyId;
}

function buildCollectionWhere(query: CollectionQuery) {
  const clauses = ["copies.deleted_at IS NULL"];
  const params: unknown[] = [];
  const search = query.search?.trim().toLocaleLowerCase();
  const filters = query.filters ?? {};

  if (search) {
    const pattern = `%${escapeLikePattern(search)}%`;

    clauses.push(`
      (
        LOWER(COALESCE(copies.title_override, '')) LIKE ? ESCAPE '\\'
        OR LOWER(COALESCE(copies.artist_override, '')) LIKE ? ESCAPE '\\'
        OR LOWER(COALESCE(releases.title, '')) LIKE ? ESCAPE '\\'
        OR LOWER(COALESCE(releases.primary_artist_name, '')) LIKE ? ESCAPE '\\'
        OR EXISTS (
          SELECT 1
          FROM copy_tags
          INNER JOIN tags ON tags.id = copy_tags.tag_id
          WHERE copy_tags.copy_id = copies.id
            AND tags.deleted_at IS NULL
            AND LOWER(tags.name) LIKE ? ESCAPE '\\'
        )
        OR EXISTS (
          SELECT 1
          FROM crate_copies
          INNER JOIN crates ON crates.id = crate_copies.crate_id
          WHERE crate_copies.copy_id = copies.id
            AND crates.deleted_at IS NULL
            AND LOWER(crates.name) LIKE ? ESCAPE '\\'
        )
      )
    `);
    params.push(pattern, pattern, pattern, pattern, pattern, pattern);
  }

  addInFilter(clauses, params, "copies.media_type", filters.mediaTypes);
  addInFilter(clauses, params, "copies.condition_media", filters.conditionMedia);
  addInFilter(clauses, params, "copies.condition_sleeve", filters.conditionSleeve);
  addInFilter(clauses, params, "copies.rating", filters.ratings);

  if (filters.tagIds?.length) {
    clauses.push(`
      EXISTS (
        SELECT 1
        FROM copy_tags
        INNER JOIN tags ON tags.id = copy_tags.tag_id
        WHERE copy_tags.copy_id = copies.id
          AND tags.deleted_at IS NULL
          AND copy_tags.tag_id IN (${getPlaceholders(filters.tagIds)})
      )
    `);
    params.push(...filters.tagIds);
  }

  if (filters.crateIds?.length) {
    clauses.push(`
      EXISTS (
        SELECT 1
        FROM crate_copies
        INNER JOIN crates ON crates.id = crate_copies.crate_id
        WHERE crate_copies.copy_id = copies.id
          AND crates.deleted_at IS NULL
          AND crate_copies.crate_id IN (${getPlaceholders(filters.crateIds)})
      )
    `);
    params.push(...filters.crateIds);
  }

  if (filters.linkage === "linked") {
    clauses.push("copies.release_id IS NOT NULL");
  }

  if (filters.linkage === "unlinked") {
    clauses.push("copies.release_id IS NULL");
  }

  return {
    whereSql: `WHERE ${clauses.join("\nAND ")}`,
    params,
  };
}

function addInFilter(
  clauses: string[],
  params: unknown[],
  column: string,
  values: (string | number)[] | undefined,
) {
  if (!values?.length) {
    return;
  }

  clauses.push(`${column} IN (${getPlaceholders(values)})`);
  params.push(...values);
}

function getCollectionOrderSql(sort: CollectionSortMode) {
  switch (sort) {
    case "title_asc":
      return "ORDER BY LOWER(COALESCE(copies.title_override, releases.title, '')) ASC, copies.created_at DESC";
    case "artist_asc":
      return "ORDER BY LOWER(COALESCE(copies.artist_override, releases.primary_artist_name, '')) ASC, LOWER(COALESCE(copies.title_override, releases.title, '')) ASC";
    case "year_desc":
      return "ORDER BY COALESCE(copies.year_override, releases.year) IS NULL ASC, COALESCE(copies.year_override, releases.year) DESC, LOWER(COALESCE(copies.title_override, releases.title, '')) ASC";
    case "year_asc":
      return "ORDER BY COALESCE(copies.year_override, releases.year) IS NULL ASC, COALESCE(copies.year_override, releases.year) ASC, LOWER(COALESCE(copies.title_override, releases.title, '')) ASC";
    case "rating_desc":
      return "ORDER BY copies.rating DESC, LOWER(COALESCE(copies.title_override, releases.title, '')) ASC";
    case "recently_added":
    default:
      return "ORDER BY copies.created_at DESC, copies.acquired_at DESC, copies.id DESC";
  }
}

function getPlaceholders(values: unknown[]) {
  return values.map(() => "?").join(", ");
}

function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

function mapRelease(row: CopyRow): Release | null {
  if (!row.release_id || !row.release_title || !row.primary_artist_name) {
    return null;
  }

  return {
    id: row.release_id,
    title: row.release_title,
    primaryArtistName: row.primary_artist_name,
    year: row.year,
    label: row.label ?? "",
    format: row.format ?? "",
    genre: row.genre ?? "",
    artwork: {
      backgroundColor: row.artwork_background_color ?? "#4d4037",
      accentColor: row.artwork_accent_color ?? "#d29a5a",
      initials: row.artwork_initials ?? "CR",
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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

function mapTag(row: TagRow): Tag {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

function createLocalId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
