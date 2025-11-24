import {
  assert,
  assertEquals,
  assertObjectMatch,
} from "std/testing/asserts";
import { getSetCookies } from "std/http/cookie";
import { join } from "std/path";
import type { HandlerContext } from "$fresh/server.ts";
import { handler } from "../login.ts";
import {
  deleteSession,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "../../../utils/session.ts";
import { createSQLiteClient } from "../../../../../packages/infrastructure/db/sqlite.ts";

type LoginBody = {
  user_id?: string;
  password?: string;
};

function createRequest(body: LoginBody) {
  return new Request("http://localhost/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function createHandlerContext(): HandlerContext {
  return {
    params: {},
    render: () => Promise.resolve(new Response()),
    state: {},
  } as HandlerContext;
}

async function prepareDb(
  users: Array<
    Omit<LoginBody, "password"> & {
      password: string;
      user_name?: string;
    }
  >,
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

  for (const user of users) {
    db.query(
      "INSERT INTO users (user_id, user_name, password) VALUES (?, ?, ?)",
      [user.user_id, user.user_name ?? user.user_id, user.password],
    );
  }

  const cleanup = async () => {
    db.close();
    await Deno.remove(tempDir, { recursive: true });
  };

  return { dbPath, cleanup };
}

Deno.test("POST /api/login returns 200 and user on valid credentials", async () => {
  const originalDbPath = Deno.env.get("DB_PATH");
  const { dbPath, cleanup } = await prepareDb([{
    user_id: "tester",
    user_name: "Tester",
    password: "secret",
  }]);

  try {
    Deno.env.set("DB_PATH", dbPath);

    const response = await handler.POST!(
      createRequest({ user_id: "tester", password: "secret" }),
      createHandlerContext(),
    );

    const body = await response.json();
    assertEquals(response.status, 200);
    assertObjectMatch(body as Record<string, unknown>, {
      user_id: "tester",
      user_name: "Tester",
    });

    const cookies = getSetCookies(response.headers);
    const sessionCookie = cookies.find((cookie) =>
      cookie.name === SESSION_COOKIE_NAME
    );

    assert(sessionCookie);
    assert(sessionCookie!.value.length > 0);
    assertEquals(sessionCookie!.httpOnly, true);
    assertEquals(sessionCookie!.sameSite, "Lax");
    assertEquals(sessionCookie!.path, "/");
    assertEquals(sessionCookie!.maxAge, SESSION_MAX_AGE_SECONDS);

    if (sessionCookie?.value) {
      deleteSession(sessionCookie.value);
    }
  } finally {
    if (originalDbPath === undefined) {
      Deno.env.delete("DB_PATH");
    } else {
      Deno.env.set("DB_PATH", originalDbPath);
    }
    await cleanup();
  }
});

Deno.test("POST /api/login returns 400 for invalid credentials", async () => {
  const originalDbPath = Deno.env.get("DB_PATH");
  const { dbPath, cleanup } = await prepareDb([]);

  try {
    Deno.env.set("DB_PATH", dbPath);

    const response = await handler.POST!(
      createRequest({ user_id: "tester", password: "wrong" }),
      createHandlerContext(),
    );

    const body = await response.json();
    assertEquals(response.status, 400);
    assertObjectMatch(body as Record<string, unknown>, {
      error: "User not found",
    });
    assertEquals(getSetCookies(response.headers).length, 0);
  } finally {
    if (originalDbPath === undefined) {
      Deno.env.delete("DB_PATH");
    } else {
      Deno.env.set("DB_PATH", originalDbPath);
    }
    await cleanup();
  }
});

Deno.test("POST /api/login returns 400 when request body is missing", async () => {
  const response = await handler.POST!(
    createRequest({ user_id: "", password: "" }),
    createHandlerContext(),
  );

  const body = await response.json();
  assertEquals(response.status, 400);
  assertObjectMatch(body as Record<string, unknown>, {
    error: "user_id と password は必須です。",
  });
  assertEquals(getSetCookies(response.headers).length, 0);
});
