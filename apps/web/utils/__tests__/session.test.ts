import {
  assert,
  assertEquals,
  assertNotEquals,
  assertObjectMatch,
} from "std/testing/asserts";
import { FakeTime } from "https://deno.land/std@0.224.0/testing/time.ts";
import {
  createSession,
  deleteSession,
  generateSessionToken,
  SESSION_MAX_AGE_SECONDS,
  validateSession,
} from "../session.ts";
import type { PublicUser } from "@domain/entities/User.ts";

const sampleUser = (overrides?: Partial<PublicUser>): PublicUser => ({
  id: 1,
  user_id: "tester",
  user_name: "テスター",
  ...overrides,
});

Deno.test("generateSessionToken returns unique values", () => {
  const tokenA = generateSessionToken();
  const tokenB = generateSessionToken();

  assertNotEquals(tokenA, tokenB);
});

Deno.test("createSession and validateSession return the session user", () => {
  const token = createSession(sampleUser());

  try {
    const session = validateSession(token);
    assert(session);
    assertObjectMatch(session, { user_id: "tester", user_name: "テスター" });
  } finally {
    deleteSession(token);
  }
});

Deno.test("validateSession rejects expired sessions", () => {
  const time = new FakeTime();
  const token = createSession(sampleUser({ user_id: "expired-user" }));

  try {
    time.tick((SESSION_MAX_AGE_SECONDS * 1000) + 1);
    const session = validateSession(token);
    assertEquals(session, null);
  } finally {
    time.restore();
    deleteSession(token);
  }
});

Deno.test("deleteSession removes session", () => {
  const token = createSession(sampleUser({ user_id: "deleter" }));

  deleteSession(token);
  const session = validateSession(token);
  assertEquals(session, null);
});
