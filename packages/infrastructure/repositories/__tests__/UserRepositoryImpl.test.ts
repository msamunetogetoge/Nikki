import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.224.0/testing/asserts.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import { createSQLiteClient } from "../../db/sqlite.ts";
import { UserRepositoryImpl } from "../UserRepositoryImpl.ts";

async function prepareDatabase() {
  const tempDir = await Deno.makeTempDir();
  const dbPath = join(tempDir, "test.db");
  const db = createSQLiteClient(dbPath);
  const schema = await Deno.readTextFile("packages/db/schema.sql");

  for (const statement of schema.split(";")) {
    const trimmed = statement.trim();
    if (trimmed.length === 0) continue;
    db.execute(`${trimmed};`);
  }

  return { db, tempDir };
}

Deno.test("UserRepositoryImpl returns user for valid credentials", async () => {
  const { db, tempDir } = await prepareDatabase();
  try {
    db.query(
      "INSERT INTO users (user_id, user_name, password) VALUES (?, ?, ?)",
      ["tester", "Tester", "secret"],
    );

    const repository = new UserRepositoryImpl(db);
    const user = await repository.findByUserIdAndPassword("tester", "secret");

    if (!user) {
      throw new Error("Expected user, got null");
    }

    assertEquals(user.user_id, "tester");
    assertEquals(user.user_name, "Tester");
    assertEquals(user.password, "secret");
  } finally {
    db.close();
    await Deno.remove(tempDir, { recursive: true });
  }
});

Deno.test("UserRepositoryImpl returns null when no user matches", async () => {
  const { db, tempDir } = await prepareDatabase();
  try {
    const repository = new UserRepositoryImpl(db);
    const user = await repository.findByUserIdAndPassword("missing", "noop");
    assertEquals(user, null);
  } finally {
    db.close();
    await Deno.remove(tempDir, { recursive: true });
  }
});

Deno.test("UserRepositoryImpl throws on duplicate results", async () => {
  const { db, tempDir } = await prepareDatabase();
  try {
    db.query(
      "INSERT INTO users (user_id, user_name, password) VALUES (?, ?, ?)",
      ["dup", "Dup One", "secret"],
    );
    db.query(
      "INSERT INTO users (user_id, user_name, password) VALUES (?, ?, ?)",
      ["dup", "Dup Two", "secret"],
    );

    const repository = new UserRepositoryImpl(db);

    await assertRejects(
      () => repository.findByUserIdAndPassword("dup", "secret"),
      Error,
      "Multi Result Found",
    );
  } finally {
    db.close();
    await Deno.remove(tempDir, { recursive: true });
  }
});
