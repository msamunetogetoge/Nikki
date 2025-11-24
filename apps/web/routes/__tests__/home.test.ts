import { assertEquals } from "std/testing/asserts";
import { FakeTime } from "https://deno.land/std@0.224.0/testing/time.ts";
import type { HandlerContext } from "$fresh/server.ts";
import { handler } from "../home.tsx";
import {
  createSession,
  deleteSession,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "../../utils/session.ts";
import type { PublicUser } from "@domain/entities/User.ts";

const sampleUser = (overrides?: Partial<PublicUser>): PublicUser => ({
  id: 1,
  user_id: "tester",
  user_name: "テスター",
  ...overrides,
});

function createHandlerContext(): HandlerContext {
  return {
    params: {},
    render: () => Promise.resolve(new Response("home", { status: 200 })),
    state: {},
  } as HandlerContext;
}

function createRequest(cookieHeader?: string) {
  const headers = cookieHeader ? { cookie: cookieHeader } : undefined;
  return new Request("http://localhost/home", { headers });
}

Deno.test("GET /home renders when session cookie is valid", async () => {
  const token = createSession(sampleUser());

  try {
    const response = await handler.GET!(
      createRequest(`${SESSION_COOKIE_NAME}=${token}`),
      createHandlerContext(),
    );

    assertEquals(response.status, 200);
  } finally {
    deleteSession(token);
  }
});

Deno.test("GET /home redirects to login when cookie is missing", async () => {
  const response = await handler.GET!(
    createRequest(),
    createHandlerContext(),
  );

  assertEquals(response.status, 302);
  assertEquals(response.headers.get("location"), "/");
});

Deno.test("GET /home redirects to login when cookie is invalid", async () => {
  const response = await handler.GET!(
    createRequest(`${SESSION_COOKIE_NAME}=invalid-token`),
    createHandlerContext(),
  );

  assertEquals(response.status, 302);
  assertEquals(response.headers.get("location"), "/");
});

Deno.test("GET /home redirects when session is expired", async () => {
  const time = new FakeTime();
  const token = createSession(sampleUser({ user_id: "expired-user" }));

  try {
    time.tick((SESSION_MAX_AGE_SECONDS * 1000) + 1);

    const response = await handler.GET!(
      createRequest(`${SESSION_COOKIE_NAME}=${token}`),
      createHandlerContext(),
    );

    assertEquals(response.status, 302);
    assertEquals(response.headers.get("location"), "/");
  } finally {
    time.restore();
    deleteSession(token);
  }
});
