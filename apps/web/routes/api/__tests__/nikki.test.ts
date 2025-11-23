import {
  assertEquals,
  assertObjectMatch,
} from "https://deno.land/std@0.224.0/testing/asserts.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import type { HandlerContext } from "$fresh/server.ts";
import { handler } from "../nikki.ts";
import { createSQLiteClient } from "../../../../../packages/infrastructure/db/sqlite.ts";

type NikkiBody = {
  // Define any body types if needed, though GET usually doesn't have one
};

function createRequest(url: string, headers: Record<string, string> = {}) {
  return new Request(url, {
    method: "GET",
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function createHandlerContext(
  user?: { id: number; user_id: string; user_name: string },
): HandlerContext {
  return {
    params: {},
    render: () => Promise.resolve(new Response()),
    state: { user },
  } as unknown as HandlerContext;
}

async function prepareDb(
  users: Array<{
    user_id: string;
    user_name?: string;
    password: string;
  }>,
  nikkis: Array<{
    user_id: string; // Helper to look up user ID
    title: string;
    body: string;
    date: string;
  }> = [],
) {
  const tempDir = await Deno.makeTempDir();
  const dbPath = join(tempDir, "test.db");
  const db = createSQLiteClient(dbPath);
  const schema = await Deno.readTextFile("../../packages/db/schema.sql");

  for (const statement of schema.split(";")) {
    const trimmed = statement.trim();
    if (trimmed.length === 0) continue;
    db.execute(`${trimmed};`);
  }

  const userIdMap = new Map<string, number>();

  for (const user of users) {
    db.query(
      "INSERT INTO users (user_id, user_name, password) VALUES (?, ?, ?)",
      [user.user_id, user.user_name ?? user.user_id, user.password],
    );
    const row = db.queryEntries<{ id: number }>(
      "SELECT id FROM users WHERE user_id = ?",
      [user.user_id],
    )[0];
    userIdMap.set(user.user_id, row.id);
  }

  for (const nikki of nikkis) {
    const userId = userIdMap.get(nikki.user_id);
    if (userId) {
      db.query(
        "INSERT INTO nikki (created_by, title, content, summary, created_at) VALUES (?, ?, ?, ?, ?)",
        [userId, nikki.title, nikki.body, "summary", nikki.date],
      );
    }
  }

  const cleanup = async () => {
    db.close();
    await Deno.remove(tempDir, { recursive: true });
  };

  return { dbPath, cleanup, userIdMap };
}

Deno.test("GET /api/nikki returns 401 if not authenticated", async () => {
  const req = createRequest("http://localhost/api/nikki");
  const ctx = createHandlerContext(undefined); // No user in state

  const response = await handler.GET!(req, ctx);
  assertEquals(response.status, 401);
  const body = await response.json();
  assertObjectMatch(body, { error: "unauthorized" });
});

Deno.test("GET /api/nikki returns 400 for invalid page", async () => {
  const req = createRequest("http://localhost/api/nikki?page=0");
  const ctx = createHandlerContext({
    id: 1,
    user_id: "test",
    user_name: "test",
  });

  const response = await handler.GET!(req, ctx);
  assertEquals(response.status, 400);
  const body = await response.json();
  assertObjectMatch(body, { error: "invalid_page" });
});

Deno.test("GET /api/nikki returns 200 and list of nikkis", async () => {
  const originalDbPath = Deno.env.get("DB_PATH");
  const { dbPath, cleanup, userIdMap } = await prepareDb(
    [{ user_id: "tester", password: "pw" }],
    [
      { user_id: "tester", title: "T1", body: "B1", date: "2023-01-01" },
      { user_id: "tester", title: "T2", body: "B2", date: "2023-01-02" },
    ],
  );
  const testerId = userIdMap.get("tester")!;

  try {
    Deno.env.set("DB_PATH", dbPath);

    const req = createRequest("http://localhost/api/nikki");
    const ctx = createHandlerContext({
      id: testerId,
      user_id: "tester",
      user_name: "Tester",
    });

    const response = await handler.GET!(req, ctx);
    assertEquals(response.status, 200);
    const body = await response.json();
    assertObjectMatch(body as Record<string, unknown>, {
      page: 1,
      pageSize: 20,
      total: 2,
    });
    const items = (body as { items: unknown[] }).items;
    assertEquals(items.length, 2);
  } finally {
    if (originalDbPath === undefined) {
      Deno.env.delete("DB_PATH");
    } else {
      Deno.env.set("DB_PATH", originalDbPath);
    }
    await cleanup();
  }
});
