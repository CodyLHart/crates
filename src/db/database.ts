import * as SQLite from "expo-sqlite";

export type LocalDatabase = {
  execAsync(source: string): Promise<unknown>;
  getAllAsync<T>(source: string, ...params: unknown[]): Promise<T[]>;
  getFirstAsync<T>(source: string, ...params: unknown[]): Promise<T | null>;
  runAsync(source: string, ...params: unknown[]): Promise<unknown>;
  withTransactionAsync(callback: () => Promise<void>): Promise<void>;
};

let databasePromise: Promise<LocalDatabase> | undefined;
let testDatabase: LocalDatabase | undefined;

export function getDatabase() {
  if (testDatabase) {
    return Promise.resolve(testDatabase);
  }

  databasePromise ??= SQLite.openDatabaseAsync("crates.db");

  return databasePromise;
}

export function setDatabaseForTests(database: LocalDatabase) {
  testDatabase = database;
  databasePromise = undefined;
}

export function resetDatabaseForTests() {
  testDatabase = undefined;
  databasePromise = undefined;
}
