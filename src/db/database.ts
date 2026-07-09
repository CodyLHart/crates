import * as SQLite from "expo-sqlite";

let databasePromise: Promise<SQLite.SQLiteDatabase> | undefined;

export function getDatabase() {
  databasePromise ??= SQLite.openDatabaseAsync("crates.db");

  return databasePromise;
}
