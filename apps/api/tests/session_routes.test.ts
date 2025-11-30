import { assert, assertEquals, assertExists } from "jsr:@std/assert"
import type { TestSuite } from "../../../scripts/deno_test_runner.ts"
import type { LoginUseCasePort } from "../src/types.ts"
import { createApp } from "../src/app.ts"

const jsonHeaders = { "content-type": "application/json" }

const defaultLoginUseCase: LoginUseCasePort = {
  execute: async () => ({ id: "alice", name: "Alice" }),
}

export const sessionRouteSuite: TestSuite = {
  name: "Session routes",
  tests: [
    {
      name: "GET /me returns current user when session is valid",
      fn: async () => {
        const authUseCase = {
          getCurrentUser: async (sessionId: string) => {
            assertEquals(sessionId, "alice")
            return { id: "alice", name: "Alice" }
          },
        }
        const app = createApp({
          loginUseCase: defaultLoginUseCase,
          authUseCase,
          getNikkiListUseCase: {
            execute: async () => ({ items: [] }),
          },
        })

        const res = await app.request("/me", {
          method: "GET",
          headers: { cookie: "session=alice" },
        })

        assertEquals(res.status, 200)
        assertEquals(await res.json(), { user: { id: "alice", name: "Alice" } })
      },
    },
    {
      name: "GET /me returns 401 when session is missing",
      fn: async () => {
        const app = createApp({
          loginUseCase: defaultLoginUseCase,
          authUseCase: { getCurrentUser: async () => null },
          getNikkiListUseCase: {
            execute: async () => ({ items: [] }),
          },
        })

        const res = await app.request("/me", { method: "GET" })

        assertEquals(res.status, 401)
      },
    },
    {
      name: "POST /logout clears the session cookie",
      fn: async () => {
        const app = createApp({
          loginUseCase: defaultLoginUseCase,
          authUseCase: { getCurrentUser: async () => ({ id: "alice", name: "Alice" }) },
          getNikkiListUseCase: {
            execute: async () => ({ items: [] }),
          },
        })

        const res = await app.request("/logout", {
          method: "POST",
          headers: jsonHeaders,
          body: "{}",
        })

        assertEquals(res.status, 200)
        assertEquals(await res.json(), { success: true })
        const cookie = res.headers.get("set-cookie")
        assertExists(cookie)
        if (!cookie) return
        const directives = cookie.split(";").map((part) => part.trim().toLowerCase())
        assert(directives.some((part) => part.startsWith("session=")))
        assert(directives.includes("max-age=0"))
      },
    },
    {
      name: "GET /nikki returns list for authenticated user",
      fn: async () => {
        const getNikkiListUseCase = {
          execute: async (userId: string, pagination: { limit?: number; offset?: number }) => {
            assertEquals(userId, "alice")
            assertEquals(pagination, { limit: 10, offset: 5 })
            return {
              items: [
                {
                  id: 1,
                  content: "Hello Nikki",
                  date: new Date("2024-01-01T00:00:00.000Z"),
                  tags: ["work"],
                  userId: "alice",
                },
              ],
            }
          },
        }
        const app = createApp({
          loginUseCase: defaultLoginUseCase,
          authUseCase: { getCurrentUser: async () => ({ id: "alice", name: "Alice" }) },
          getNikkiListUseCase,
        })

        const res = await app.request("/nikki?limit=10&offset=5", {
          method: "GET",
          headers: { cookie: "session=alice" },
        })

        assertEquals(res.status, 200)
        assertEquals(await res.json(), {
          items: [
            {
              id: 1,
              content: "Hello Nikki",
              date: "2024-01-01T00:00:00.000Z",
              tags: ["work"],
            },
          ],
        })
      },
    },
    {
      name: "GET /nikki returns 401 when not authenticated",
      fn: async () => {
        const app = createApp({
          loginUseCase: defaultLoginUseCase,
          authUseCase: { getCurrentUser: async () => null },
          getNikkiListUseCase: {
            execute: async () => ({ items: [] }),
          },
        })

        const res = await app.request("/nikki", { method: "GET" })

        assertEquals(res.status, 401)
      },
    },
  ],
}
