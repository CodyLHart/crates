import { resetDatabaseInitializationForTests } from "@/db/client";
import { resetDatabaseForTests, setDatabaseForTests } from "@/db/database";
import { runMigrations } from "@/db/migrations";
import {
  createCrate,
  createCustomCopy,
  createJournalEntry,
  createTag,
  deleteTag,
  getCopyWithRelease,
  getCrateWithCopies,
  getJournalEntry,
  listCollectionCopies,
  listCopies,
  listCrates,
  listJournalEntries,
  listJournalEntriesForCopy,
  listRecentJournalEntries,
  listTags,
  softDeleteJournalEntry,
  updateCopy,
  updateCrate,
  updateJournalEntry,
  updateTag,
} from "@/db/repositories";
import type { JournalEntryType } from "@/types/domain";

import { InMemoryDatabase } from "../__testUtils__/inMemoryDatabase";

describe("local SQLite migrations and seed data", () => {
  afterEach(() => {
    resetDatabaseInitializationForTests();
    resetDatabaseForTests();
  });

  it("runs migrations and creates the stabilized local schema", async () => {
    const database = new InMemoryDatabase();

    await runMigrations(database);

    const migrations = await database.getAllAsync<{ id: number }>(
      "SELECT id FROM schema_migrations",
    );
    const releaseColumns = await database.getAllAsync<{ name: string; notnull: 0 | 1 }>(
      "PRAGMA table_info(releases)",
    );
    const copyColumns = await database.getAllAsync<{ name: string }>("PRAGMA table_info(copies)");
    const journalEntries = await database.getAllAsync<{ type: string }>(
      "SELECT id, copy_id, type, title, body, date, occurred_at, created_at, updated_at, deleted_at FROM journal_entries",
    );

    expect(migrations.map((migration) => migration.id)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(releaseColumns.find((column) => column.name === "year")?.notnull).toBe(0);
    expect(copyColumns.map((column) => column.name)).toEqual(
      expect.arrayContaining(["created_at", "updated_at", "deleted_at"]),
    );
    expect(journalEntries.map((entry) => entry.type)).toEqual(
      expect.arrayContaining(["memory", "note", "listening_event", "purchase"]),
    );
  });

  it("is idempotent for migrations and initial seed data", async () => {
    const database = new InMemoryDatabase();

    await runMigrations(database);
    await runMigrations(database);

    expect(database.count("schema_migrations")).toBe(7);
    expect(database.count("releases")).toBe(5);
    expect(database.count("copies")).toBe(5);
    expect(database.count("crates")).toBe(3);
    expect(database.count("crate_copies")).toBe(6);
    expect(database.count("tags")).toBe(5);
    expect(database.count("copy_tags")).toBe(6);
    expect(database.count("journal_entries")).toBe(4);
  });
});

describe("journal repositories", () => {
  let database: InMemoryDatabase;

  beforeEach(() => {
    database = new InMemoryDatabase();
    resetDatabaseInitializationForTests();
    setDatabaseForTests(database);
  });

  afterEach(() => {
    resetDatabaseInitializationForTests();
    resetDatabaseForTests();
  });

  it.each(["note", "memory", "purchase", "listening_event"] as const)(
    "creates a %s Journal entry",
    async (type: JournalEntryType) => {
      const entryId = await createJournalEntry({
        copyId: "copy-blue-train",
        type,
        title: `A ${type} title`,
        body: "Stored locally.",
        occurredAt: "2026-07-10T12:30:00.000Z",
      });

      const entry = await getJournalEntry(entryId);

      expect(entry?.id).toBe(entryId);
      expect(entry?.type).toBe(type);
      expect(entry?.copy.id).toBe("copy-blue-train");
      expect(entry?.occurredAt).toBe("2026-07-10T12:30:00.000Z");
    },
  );

  it("edits an entry while preserving its stable ID", async () => {
    const entryId = await createJournalEntry({
      copyId: "copy-blue-train",
      type: "note",
      title: "Before",
      body: "Old body.",
      occurredAt: "2026-07-10T12:30:00.000Z",
    });

    await updateJournalEntry(entryId, {
      copyId: "copy-hounds-love",
      type: "memory",
      title: "After",
      body: "Updated body.",
      occurredAt: "2026-07-11T09:00:00.000Z",
    });

    const entry = await getJournalEntry(entryId);

    expect(entry?.id).toBe(entryId);
    expect(entry?.copyId).toBe("copy-hounds-love");
    expect(entry?.type).toBe("memory");
    expect(entry?.title).toBe("After");
    expect(entry?.body).toBe("Updated body.");
    expect(entry?.occurredAt).toBe("2026-07-11T09:00:00.000Z");
  });

  it("soft deletes an entry and excludes it from normal queries", async () => {
    const entryId = await createJournalEntry({
      copyId: "copy-blue-train",
      type: "note",
      body: "Temporary thought.",
      occurredAt: "2026-07-10T12:30:00.000Z",
    });

    await softDeleteJournalEntry(entryId);

    expect(await getJournalEntry(entryId)).toBeUndefined();
    expect((await listJournalEntries()).map((entry) => entry.id)).not.toContain(entryId);
    expect(
      (await listJournalEntriesForCopy("copy-blue-train")).map((entry) => entry.id),
    ).not.toContain(entryId);
    expect(
      database.tables.journal_entries.find((entry) => entry.id === entryId)?.deleted_at,
    ).toEqual(expect.any(String));
  });

  it("orders Journal entries by occurred_at newest first", async () => {
    const olderId = await createJournalEntry({
      copyId: "copy-blue-train",
      type: "note",
      body: "Older",
      occurredAt: "2026-07-08T10:00:00.000Z",
    });
    const newerId = await createJournalEntry({
      copyId: "copy-blue-train",
      type: "note",
      body: "Newer",
      occurredAt: "2026-07-12T10:00:00.000Z",
    });

    const entries = await listJournalEntriesForCopy("copy-blue-train");

    expect(entries.map((entry) => entry.id).indexOf(newerId)).toBeLessThan(
      entries.map((entry) => entry.id).indexOf(olderId),
    );
  });

  it("hydrates Journal entries for linked and unlinked Copies", async () => {
    const customCopyId = await createCustomCopy({
      title: "Basement Tape",
      artist: "Local Shelf",
      mediaType: "Cassette",
    });
    const linkedEntryId = await createJournalEntry({
      copyId: "copy-blue-train",
      type: "note",
      body: "Linked Copy entry.",
      occurredAt: "2026-07-12T10:00:00.000Z",
    });
    const unlinkedEntryId = await createJournalEntry({
      copyId: customCopyId,
      type: "memory",
      body: "Unlinked Copy entry.",
      occurredAt: "2026-07-13T10:00:00.000Z",
    });

    const entries = await listJournalEntries();
    const linkedEntry = entries.find((entry) => entry.id === linkedEntryId);
    const unlinkedEntry = entries.find((entry) => entry.id === unlinkedEntryId);

    expect(linkedEntry?.copy.release?.title).toBe("Blue Train");
    expect(unlinkedEntry?.copy.release).toBeNull();
    expect(unlinkedEntry?.copy.titleOverride).toBe("Basement Tape");
  });

  it("returns hydrated Journal tab entries and copy-specific entries", async () => {
    const entryId = await createJournalEntry({
      copyId: "copy-hounds-love",
      type: "purchase",
      title: "Shop counter",
      body: "Found near closing.",
      occurredAt: "2026-07-14T18:45:00.000Z",
    });

    const journalEntries = await listJournalEntries();
    const copyEntries = await listJournalEntriesForCopy("copy-hounds-love");

    expect(journalEntries.find((entry) => entry.id === entryId)?.copy.id).toBe("copy-hounds-love");
    expect(copyEntries.map((entry) => entry.id)).toContain(entryId);
  });
});

describe("local repositories", () => {
  let database: InMemoryDatabase;

  beforeEach(() => {
    database = new InMemoryDatabase();
    resetDatabaseInitializationForTests();
    setDatabaseForTests(database);
  });

  afterEach(() => {
    resetDatabaseInitializationForTests();
    resetDatabaseForTests();
  });

  it("hydrates linked and unlinked Copies truthfully", async () => {
    const copyId = await createCustomCopy({
      title: "Basement Demos",
      artist: "The Local Pressings",
      mediaType: "Cassette",
      year: 1997,
    });

    const linkedCopy = await getCopyWithRelease("copy-hounds-love");
    const unlinkedCopy = await getCopyWithRelease(copyId);

    expect(linkedCopy?.release?.title).toBe("Hounds of Love");
    expect(unlinkedCopy?.release).toBeNull();
    expect(unlinkedCopy?.titleOverride).toBe("Basement Demos");
    expect(unlinkedCopy?.artistOverride).toBe("The Local Pressings");
    expect(unlinkedCopy?.yearOverride).toBe(1997);
  });

  it("creates a custom unlinked Copy with Tags, Crates, and an initial Journal note", async () => {
    const copyId = await createCustomCopy({
      title: "Local Only",
      artist: "No Provider",
      mediaType: "Vinyl",
      conditionMedia: "VG+",
      conditionSleeve: "VG",
      rating: 4,
      tagIds: ["tag-favorite"],
      crateIds: ["crate-sunday-morning"],
      initialJournalNote: "Bought after the early set.",
    });

    const copy = await getCopyWithRelease(copyId);
    const journalEntries = await listRecentJournalEntries();

    expect(copy?.release).toBeNull();
    expect(copy?.condition).toBe("VG+");
    expect(copy?.tags.map((tag) => tag.id)).toEqual(["tag-favorite"]);
    expect(copy?.crates.map((crate) => crate.id)).toEqual(["crate-sunday-morning"]);
    expect(journalEntries.find((entry) => entry.copyId === copyId)?.type).toBe("note");
  });

  it("updates a Copy and replaces Tag and Crate memberships", async () => {
    await updateCopy("copy-hounds-love", {
      title: "Hounds of Love",
      artist: "Kate Bush",
      mediaType: "Vinyl",
      year: 1985,
      conditionMedia: "VG+",
      conditionSleeve: "VG+",
      rating: 3,
      tagIds: ["tag-late-night"],
      crateIds: ["crate-floor-fillers"],
    });

    const copy = await getCopyWithRelease("copy-hounds-love");

    expect(copy?.condition).toBe("VG+");
    expect(copy?.rating).toBe(3);
    expect(copy?.tags.map((tag) => tag.id)).toEqual(["tag-late-night"]);
    expect(copy?.crates.map((crate) => crate.id)).toEqual(["crate-floor-fillers"]);

    await updateCopy("copy-hounds-love", {
      title: "Hounds of Love",
      artist: "Kate Bush",
      mediaType: "Vinyl",
      year: 1985,
      conditionMedia: "VG+",
      conditionSleeve: "VG+",
      rating: 3,
      tagIds: [],
      crateIds: [],
    });

    const updatedCopy = await getCopyWithRelease("copy-hounds-love");

    expect(updatedCopy?.tags).toHaveLength(0);
    expect(updatedCopy?.crates).toHaveLength(0);
  });

  it("creates and updates Crates with Copy memberships", async () => {
    const crateId = await createCrate({
      name: "Road Trip",
      description: "Long sides for long drives.",
      coverBehavior: "generated",
      copyIds: ["copy-blue-train", "copy-sign-times"],
    });

    const createdCrate = await getCrateWithCopies(crateId);

    expect(createdCrate?.crate.name).toBe("Road Trip");
    expect(createdCrate?.crate.coverBehavior).toBe("generated");
    expect(createdCrate?.copies.map((copy) => copy.id)).toEqual([
      "copy-sign-times",
      "copy-blue-train",
    ]);

    await updateCrate(crateId, {
      name: "Quiet Room",
      description: "Lower lights.",
      coverBehavior: "auto",
      copyIds: ["copy-hounds-love"],
    });

    const updatedCrate = await getCrateWithCopies(crateId);

    expect(updatedCrate?.crate.name).toBe("Quiet Room");
    expect(updatedCrate?.crate.description).toBe("Lower lights.");
    expect(updatedCrate?.copies.map((copy) => copy.id)).toEqual(["copy-hounds-love"]);
  });

  it("creates, updates, and deletes Tags without deleting Copies", async () => {
    const initialCopyCount = (await listCopies()).length;
    const tagId = await createTag({ name: "Sleeper", color: "#5f6f52" });

    await updateTag(tagId, { name: "Deep Cut", color: "#6f5368" });

    const updatedTag = (await listTags()).find((tag) => tag.id === tagId);

    expect(updatedTag?.name).toBe("Deep Cut");
    expect(updatedTag?.color).toBe("#6f5368");

    await updateCopy("copy-blue-train", {
      title: "Blue Train",
      artist: "John Coltrane",
      mediaType: "Vinyl",
      year: 1958,
      conditionMedia: "VG+",
      conditionSleeve: "VG+",
      rating: 5,
      tagIds: [tagId],
      crateIds: ["crate-sunday-morning"],
    });

    await deleteTag(tagId);

    const copy = await getCopyWithRelease("copy-blue-train");

    expect(await listTags()).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: tagId })]),
    );
    expect(copy?.tags).toHaveLength(0);
    expect((await listCopies()).length).toBe(initialCopyCount);
  });

  it("lists Crates and Tags through non-deleted repository views", async () => {
    await createTag({ name: "Morning", color: "#d29a5a" });
    await createCrate({
      name: "After Hours",
      description: "Late shelves.",
      coverBehavior: "auto",
      copyIds: [],
    });

    expect((await listTags()).map((tag) => tag.name)).toContain("Morning");
    expect((await listCrates()).map((crate) => crate.name)).toContain("After Hours");
  });
});

describe("collection query repository", () => {
  let database: InMemoryDatabase;

  beforeEach(() => {
    database = new InMemoryDatabase();
    resetDatabaseInitializationForTests();
    setDatabaseForTests(database);
  });

  afterEach(() => {
    resetDatabaseInitializationForTests();
    resetDatabaseForTests();
  });

  it("searches titles case-insensitively and trims whitespace", async () => {
    const results = await listCollectionCopies({ search: "  hOuNdS  " });

    expect(results.map((copy) => copy.id)).toEqual(["copy-hounds-love"]);
  });

  it("searches linked release artists and copy artist overrides", async () => {
    const customCopyId = await createCustomCopy({
      title: "Basement Demos",
      artist: "Needle Ghosts",
      mediaType: "Cassette",
    });

    expect((await listCollectionCopies({ search: "coltrane" })).map((copy) => copy.id)).toEqual([
      "copy-blue-train",
    ]);
    expect((await listCollectionCopies({ search: "needle" })).map((copy) => copy.id)).toEqual([
      customCopyId,
    ]);
  });

  it("searches Tag names through SQLite relationships", async () => {
    const results = await listCollectionCopies({ search: "gift" });

    expect(results.map((copy) => copy.id)).toEqual(["copy-hounds-love"]);
  });

  it("searches Crate names through SQLite relationships", async () => {
    const results = await listCollectionCopies({ search: "floor" });

    expect(results.map((copy) => copy.id)).toEqual(["copy-sign-times", "copy-songs-key-life"]);
  });

  it("combines filters from different categories using AND behavior", async () => {
    const results = await listCollectionCopies({
      filters: {
        crateIds: ["crate-floor-fillers"],
        tagIds: ["tag-sample-source"],
        ratings: [5],
      },
    });

    expect(results.map((copy) => copy.id)).toEqual(["copy-songs-key-life"]);
  });

  it("combines multiple values inside one filter category using OR behavior", async () => {
    await createCustomCopy({
      title: "Tape Loop",
      artist: "Local Shelf",
      mediaType: "Cassette",
    });
    await createCustomCopy({
      title: "Compact Proof",
      artist: "Local Shelf",
      mediaType: "CD",
    });

    const results = await listCollectionCopies({
      filters: {
        mediaTypes: ["Cassette", "CD"],
      },
      sort: "title_asc",
    });

    expect(results.map((copy) => copy.mediaType)).toEqual(["CD", "Cassette"]);
  });

  it("filters linked and unlinked Copies", async () => {
    const customCopyId = await createCustomCopy({
      title: "Hand Dub",
      artist: "Local Shelf",
      mediaType: "Cassette",
    });

    expect(
      (await listCollectionCopies({ filters: { linkage: "linked" } })).map((copy) => copy.id),
    ).not.toContain(customCopyId);
    expect(
      (await listCollectionCopies({ filters: { linkage: "unlinked" } })).map((copy) => copy.id),
    ).toEqual([customCopyId]);
  });

  it.each([
    ["recently_added", ["copy-music-right-children", "copy-sign-times", "copy-blue-train"]],
    ["title_asc", ["copy-blue-train", "copy-hounds-love", "copy-music-right-children"]],
    ["artist_asc", ["copy-music-right-children", "copy-blue-train", "copy-hounds-love"]],
    ["year_desc", ["copy-music-right-children", "copy-sign-times", "copy-hounds-love"]],
    ["year_asc", ["copy-blue-train", "copy-songs-key-life", "copy-hounds-love"]],
    ["rating_desc", ["copy-blue-train", "copy-hounds-love", "copy-sign-times"]],
  ] as const)("sorts by %s", async (sort, expectedLeadingCopyIds) => {
    const results = await listCollectionCopies({ sort });

    expect(results.slice(0, 3).map((copy) => copy.id)).toEqual(expectedLeadingCopyIds);
  });

  it("returns the normal collection for an empty query", async () => {
    const emptyQueryResults = await listCollectionCopies({ search: "   " });
    const normalResults = await listCollectionCopies();

    expect(emptyQueryResults.map((copy) => copy.id)).toEqual(normalResults.map((copy) => copy.id));
  });

  it("returns no results for unmatched searches", async () => {
    const results = await listCollectionCopies({ search: "no record lives here" });

    expect(results).toHaveLength(0);
  });

  it("treats SQL LIKE special characters as literal search text", async () => {
    const copyId = await createCustomCopy({
      title: "100% Pure _ Demo",
      artist: "Literal Match",
      mediaType: "Vinyl",
    });

    const results = await listCollectionCopies({ search: "100% pure _" });

    expect(results.map((copy) => copy.id)).toEqual([copyId]);
  });
});
