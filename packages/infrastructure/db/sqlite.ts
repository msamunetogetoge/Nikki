import { DB } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";
import { fromFileUrl } from "https://deno.land/std@0.224.0/path/mod.ts";

export type SQLiteClient = DB;

export function defaultDbPath(): string {
  const envPath = Deno.env.get("DB_PATH");
  if (envPath && envPath.trim().length > 0) {
    return envPath;
  }

  return fromFileUrl(new URL("../../db/nikki.db", import.meta.url));
}

export function createSQLiteClient(dbPath = defaultDbPath()): SQLiteClient {
  return new DB(dbPath);
}
