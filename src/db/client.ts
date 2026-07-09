import { getDatabase } from "@/db/database";
import { runMigrations } from "@/db/migrations";

let initializationPromise: Promise<void> | undefined;

export async function initializeDatabase() {
  if (!initializationPromise) {
    initializationPromise = getDatabase().then(runMigrations);
  }

  return initializationPromise;
}
