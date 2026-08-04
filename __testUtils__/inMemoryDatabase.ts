import type { LocalDatabase } from "@/db/database";

type Row = Record<string, unknown>;

type TableName =
  | "schema_migrations"
  | "releases"
  | "copies"
  | "crates"
  | "crate_copies"
  | "tags"
  | "copy_tags"
  | "journal_entries";

type ColumnInfo = {
  name: string;
  notnull: 0 | 1;
};

const baseColumns = {
  schema_migrations: [
    { name: "id", notnull: 1 },
    { name: "name", notnull: 1 },
    { name: "applied_at", notnull: 1 },
  ],
  releases: [
    { name: "id", notnull: 1 },
    { name: "title", notnull: 1 },
    { name: "primary_artist_name", notnull: 1 },
    { name: "year", notnull: 1 },
    { name: "label", notnull: 1 },
    { name: "format", notnull: 1 },
    { name: "genre", notnull: 1 },
    { name: "artwork_background_color", notnull: 1 },
    { name: "artwork_accent_color", notnull: 1 },
    { name: "artwork_initials", notnull: 1 },
  ],
  copies: [
    { name: "id", notnull: 1 },
    { name: "release_id", notnull: 0 },
    { name: "media_type", notnull: 1 },
    { name: "title_override", notnull: 0 },
    { name: "artist_override", notnull: 0 },
    { name: "year_override", notnull: 0 },
    { name: "condition", notnull: 1 },
    { name: "condition_media", notnull: 0 },
    { name: "condition_sleeve", notnull: 0 },
    { name: "rating", notnull: 1 },
    { name: "acquired_from", notnull: 1 },
    { name: "acquired_at", notnull: 1 },
    { name: "personal_note", notnull: 1 },
    { name: "last_played_at", notnull: 1 },
  ],
  crates: [
    { name: "id", notnull: 1 },
    { name: "name", notnull: 1 },
    { name: "description", notnull: 1 },
  ],
  crate_copies: [
    { name: "crate_id", notnull: 1 },
    { name: "copy_id", notnull: 1 },
    { name: "position", notnull: 1 },
  ],
  tags: [
    { name: "id", notnull: 1 },
    { name: "name", notnull: 1 },
  ],
  copy_tags: [
    { name: "copy_id", notnull: 1 },
    { name: "tag_id", notnull: 1 },
  ],
  journal_entries: [
    { name: "id", notnull: 1 },
    { name: "copy_id", notnull: 1 },
    { name: "type", notnull: 1 },
    { name: "title", notnull: 1 },
    { name: "body", notnull: 1 },
    { name: "date", notnull: 1 },
  ],
} satisfies Record<TableName, ColumnInfo[]>;

export class InMemoryDatabase implements LocalDatabase {
  readonly tables: Record<TableName, Row[]> = {
    schema_migrations: [],
    releases: [],
    copies: [],
    crates: [],
    crate_copies: [],
    tags: [],
    copy_tags: [],
    journal_entries: [],
  };

  readonly columns: Record<TableName, ColumnInfo[]> = structuredClone(baseColumns);

  async execAsync(sql: string) {
    if (sql.includes("ALTER TABLE crates ADD COLUMN cover_behavior")) {
      this.addColumn("crates", "cover_behavior", 1);
      this.tables.crates.forEach((crate) => {
        crate.cover_behavior ??= "auto";
      });
    }

    if (sql.includes("ALTER TABLE tags ADD COLUMN color")) {
      this.addColumn("tags", "color", 1);
      this.tables.tags.forEach((tag) => {
        tag.color ??= "#d29a5a";
      });
    }

    if (sql.includes("releases_next")) {
      this.columns.releases = this.columns.releases.map((column) =>
        column.name === "year" ? { ...column, notnull: 0 } : column,
      );
    }

    if (sql.includes("ALTER TABLE copies ADD COLUMN created_at")) {
      this.addLifecycleColumns("copies");
      this.addLifecycleColumns("crates");
      this.addLifecycleColumns("tags");
      this.addLifecycleColumns("journal_entries");
      this.tables.journal_entries.forEach((entry) => {
        entry.type = normalizeJournalType(String(entry.type));
      });
    }
  }

  async getFirstAsync<T>(sql: string, ...params: unknown[]) {
    if (sql.includes("SELECT id FROM schema_migrations")) {
      return this.tables.schema_migrations.find((row) => row.id === params[0]) as T | null;
    }

    if (sql.includes("SELECT COUNT(*) AS count FROM copies")) {
      return { count: this.tables.copies.length } as T;
    }

    if (sql.includes("PRAGMA table_info")) {
      return this.getTableInfo(sql).at(0) as T | null;
    }

    if (sql.includes("FROM copies")) {
      return this.copyRows().find((row) => row.copy_id === params[0]) as T | null;
    }

    if (sql.includes("FROM crates")) {
      return this.visibleRows("crates").find((row) => row.id === params[0]) as T | null;
    }

    return null;
  }

  async getAllAsync<T>(sql: string, ...params: unknown[]) {
    if (sql.includes("PRAGMA table_info")) {
      return this.getTableInfo(sql) as T[];
    }

    if (sql.includes("FROM schema_migrations")) {
      return [...this.tables.schema_migrations] as T[];
    }

    if (sql.includes("FROM copies")) {
      return this.copyRows().sort(sortByString("last_played_at", "desc")) as T[];
    }

    if (sql.includes("FROM crates") && sql.includes("INNER JOIN crate_copies")) {
      const copyId = params[0];
      const crateIds = this.tables.crate_copies
        .filter((row) => row.copy_id === copyId)
        .sort(sortByNumber("position"))
        .map((row) => row.crate_id);

      return crateIds
        .map((crateId) => this.visibleRows("crates").find((crate) => crate.id === crateId))
        .filter(Boolean) as T[];
    }

    if (sql.includes("FROM crates")) {
      return this.visibleRows("crates").sort(sortByString("name")) as T[];
    }

    if (sql.includes("FROM tags") && sql.includes("INNER JOIN copy_tags")) {
      const copyId = params[0];
      const tagIds = this.tables.copy_tags
        .filter((row) => row.copy_id === copyId)
        .map((row) => row.tag_id);

      return this.visibleRows("tags")
        .filter((tag) => tagIds.includes(tag.id))
        .sort(sortByString("name")) as T[];
    }

    if (sql.includes("FROM tags")) {
      return this.visibleRows("tags").sort(sortByString("name")) as T[];
    }

    if (sql.includes("FROM journal_entries") && sql.includes("WHERE copy_id")) {
      return this.visibleRows("journal_entries")
        .filter((entry) => entry.copy_id === params[0])
        .sort(sortByString("date", "desc")) as T[];
    }

    if (sql.includes("FROM journal_entries")) {
      return this.visibleRows("journal_entries").sort(sortByString("date", "desc")) as T[];
    }

    return [];
  }

  async runAsync(sql: string, ...params: unknown[]) {
    if (sql.includes("INSERT INTO schema_migrations")) {
      this.insert("schema_migrations", ["id", "name", "applied_at"], params, "id");
      return;
    }

    if (sql.includes("INSERT OR IGNORE INTO releases")) {
      this.insert(
        "releases",
        [
          "id",
          "title",
          "primary_artist_name",
          "year",
          "label",
          "format",
          "genre",
          "artwork_background_color",
          "artwork_accent_color",
          "artwork_initials",
        ],
        params,
        "id",
        true,
      );
      return;
    }

    if (sql.includes("INSERT OR IGNORE INTO copies") || sql.includes("INSERT INTO copies")) {
      this.insert(
        "copies",
        [
          "id",
          "release_id",
          "media_type",
          "title_override",
          "artist_override",
          "year_override",
          "condition",
          "condition_media",
          "condition_sleeve",
          "rating",
          "acquired_from",
          "acquired_at",
          "personal_note",
          "last_played_at",
          "created_at",
          "updated_at",
          "deleted_at",
        ],
        params,
        "id",
        sql.includes("OR IGNORE"),
      );
      return;
    }

    if (sql.includes("INSERT OR IGNORE INTO crates") || sql.includes("INSERT INTO crates")) {
      this.insert(
        "crates",
        ["id", "name", "description", "cover_behavior", "created_at", "updated_at", "deleted_at"],
        params,
        "id",
        sql.includes("OR IGNORE"),
      );
      return;
    }

    if (sql.includes("INSERT OR IGNORE INTO tags") || sql.includes("INSERT INTO tags")) {
      this.insert(
        "tags",
        ["id", "name", "color", "created_at", "updated_at", "deleted_at"],
        params,
        "id",
        sql.includes("OR IGNORE"),
      );
      return;
    }

    if (
      sql.includes("INSERT OR IGNORE INTO crate_copies") ||
      sql.includes("INSERT OR REPLACE INTO crate_copies")
    ) {
      this.upsertJoin(
        "crate_copies",
        ["crate_id", "copy_id"],
        ["crate_id", "copy_id", "position"],
        params,
      );
      return;
    }

    if (
      sql.includes("INSERT OR IGNORE INTO copy_tags") ||
      sql.includes("INSERT OR REPLACE INTO copy_tags")
    ) {
      this.upsertJoin("copy_tags", ["copy_id", "tag_id"], ["copy_id", "tag_id"], params);
      return;
    }

    if (
      sql.includes("INSERT OR IGNORE INTO journal_entries") ||
      sql.includes("INSERT INTO journal_entries")
    ) {
      this.insert(
        "journal_entries",
        [
          "id",
          "copy_id",
          "type",
          "title",
          "body",
          "date",
          "created_at",
          "updated_at",
          "deleted_at",
        ],
        params,
        "id",
        sql.includes("OR IGNORE"),
      );
      return;
    }

    if (sql.includes("UPDATE tags SET")) {
      this.updateById("tags", String(params[3]), {
        name: params[0],
        color: params[1],
        updated_at: params[2],
      });
      return;
    }

    if (sql.includes("UPDATE crates")) {
      this.updateById("crates", String(params[4]), {
        name: params[0],
        description: params[1],
        cover_behavior: params[2],
        updated_at: params[3],
      });
      return;
    }

    if (sql.includes("UPDATE copies")) {
      this.updateById("copies", String(params[9]), {
        media_type: params[0],
        title_override: params[1],
        artist_override: params[2],
        year_override: params[3],
        condition: params[4],
        condition_media: params[5],
        condition_sleeve: params[6],
        rating: params[7],
        updated_at: params[8],
      });
      return;
    }

    if (sql.includes("DELETE FROM tags")) {
      const tagId = params[0];
      this.tables.tags = this.tables.tags.filter((tag) => tag.id !== tagId);
      this.tables.copy_tags = this.tables.copy_tags.filter((join) => join.tag_id !== tagId);
      return;
    }

    if (sql.includes("DELETE FROM crate_copies WHERE copy_id")) {
      this.tables.crate_copies = this.tables.crate_copies.filter(
        (join) => join.copy_id !== params[0],
      );
      return;
    }

    if (sql.includes("DELETE FROM crate_copies WHERE crate_id")) {
      this.tables.crate_copies = this.tables.crate_copies.filter(
        (join) => join.crate_id !== params[0],
      );
      return;
    }

    if (sql.includes("DELETE FROM copy_tags")) {
      this.tables.copy_tags = this.tables.copy_tags.filter((join) => join.copy_id !== params[0]);
    }
  }

  async withTransactionAsync(callback: () => Promise<void>) {
    await callback();
  }

  count(table: TableName) {
    return this.tables[table].length;
  }

  private addColumn(table: TableName, name: string, notnull: 0 | 1) {
    if (!this.columns[table].some((column) => column.name === name)) {
      this.columns[table].push({ name, notnull });
    }
  }

  private addLifecycleColumns(table: TableName) {
    this.addColumn(table, "created_at", 1);
    this.addColumn(table, "updated_at", 1);
    this.addColumn(table, "deleted_at", 0);

    this.tables[table].forEach((row) => {
      row.created_at ??= "1970-01-01T00:00:00.000Z";
      row.updated_at ??= "1970-01-01T00:00:00.000Z";
      row.deleted_at ??= null;
    });
  }

  private getTableInfo(sql: string) {
    const table = sql.match(/PRAGMA table_info\((\w+)\)/)?.[1] as TableName | undefined;

    return table ? this.columns[table] : [];
  }

  private visibleRows(table: TableName) {
    return this.tables[table].filter(
      (row) => row.deleted_at === undefined || row.deleted_at === null,
    );
  }

  private insert(
    table: TableName,
    columns: string[],
    params: unknown[],
    primaryKey: string,
    ignoreExisting = false,
  ) {
    const row = Object.fromEntries(columns.map((column, index) => [column, params[index]]));
    const existingIndex = this.tables[table].findIndex(
      (item) => item[primaryKey] === row[primaryKey],
    );

    if (existingIndex >= 0 && ignoreExisting) {
      return;
    }

    if (existingIndex >= 0) {
      this.tables[table][existingIndex] = row;
      return;
    }

    this.tables[table].push(row);
  }

  private upsertJoin(
    table: "crate_copies" | "copy_tags",
    keyColumns: string[],
    columns: string[],
    params: unknown[],
  ) {
    const row = Object.fromEntries(columns.map((column, index) => [column, params[index]]));
    const existingIndex = this.tables[table].findIndex((item) =>
      keyColumns.every((column) => item[column] === row[column]),
    );

    if (existingIndex >= 0) {
      this.tables[table][existingIndex] = row;
      return;
    }

    this.tables[table].push(row);
  }

  private updateById(table: TableName, id: string, values: Row) {
    const row = this.tables[table].find((item) => item.id === id && item.deleted_at == null);

    if (!row) {
      return;
    }

    Object.assign(row, values);
  }

  private copyRows() {
    return this.visibleRows("copies").map((copy) => {
      const release = this.tables.releases.find((row) => row.id === copy.release_id);

      return {
        copy_id: copy.id,
        release_id: copy.release_id,
        media_type: copy.media_type,
        title_override: copy.title_override,
        artist_override: copy.artist_override,
        year_override: copy.year_override,
        condition: copy.condition,
        condition_media: copy.condition_media,
        condition_sleeve: copy.condition_sleeve,
        rating: copy.rating,
        acquired_from: copy.acquired_from,
        acquired_at: copy.acquired_at,
        personal_note: copy.personal_note,
        last_played_at: copy.last_played_at,
        created_at: copy.created_at,
        updated_at: copy.updated_at,
        deleted_at: copy.deleted_at,
        release_title: release?.title ?? null,
        primary_artist_name: release?.primary_artist_name ?? null,
        year: release?.year ?? null,
        label: release?.label ?? null,
        format: release?.format ?? null,
        genre: release?.genre ?? null,
        artwork_background_color: release?.artwork_background_color ?? null,
        artwork_accent_color: release?.artwork_accent_color ?? null,
        artwork_initials: release?.artwork_initials ?? null,
      };
    });
  }
}

function sortByString(key: string, direction: "asc" | "desc" = "asc") {
  return (left: Row, right: Row) => {
    const order = String(left[key]).localeCompare(String(right[key]));

    return direction === "asc" ? order : -order;
  };
}

function sortByNumber(key: string) {
  return (left: Row, right: Row) => Number(left[key]) - Number(right[key]);
}

function normalizeJournalType(value: string) {
  if (value === "Memory") {
    return "memory";
  }

  if (value === "Note") {
    return "note";
  }

  if (value === "Listening Event") {
    return "listening_event";
  }

  if (value === "Purchase") {
    return "purchase";
  }

  return value;
}
