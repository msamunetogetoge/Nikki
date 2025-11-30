/// <reference lib="deno.ns" />
import { assertEquals, assertRejects } from "jsr:@std/assert"
import type { TestSuite } from "../../../scripts/deno_test_runner.ts"
import { fetchNikkis, getCurrentUser, login, logout } from "./api.ts"

const setupFetchMock = (response: Response) => {
  const calls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = []
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ input, init })
    return response
  }
  return calls
}

const restoreEnv = (key: string, previous: string | undefined) => {
  if (previous === undefined) {
    Deno.env.delete(key)
  } else {
    Deno.env.set(key, previous)
  }
}

export const apiClientSuite: TestSuite = {
  name: "Frontend API client",
  tests: [
    {
      name: "posts credentials and returns response body on success",
      fn: async () => {
        const previousFetch = globalThis.fetch
        const previousBaseUrl = Deno.env.get("NEXT_PUBLIC_API_BASE_URL")
        const responseBody = { success: true, user: { id: "alice", name: "Alice" } }
        const calls = setupFetchMock(
          new Response(JSON.stringify(responseBody), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        )
        try {
          Deno.env.set("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8000")

          const result = await login({ user_id: "alice", password: "secret" })

          assertEquals(result, responseBody)
          assertEquals(calls.length, 1)
          assertEquals(calls[0], {
            input: "http://localhost:8000/login",
            init: {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ user_id: "alice", password: "secret" }),
            },
          })
        } finally {
          restoreEnv("NEXT_PUBLIC_API_BASE_URL", previousBaseUrl)
          globalThis.fetch = previousFetch
        }
      },
    },
    {
      name: "throws on non-200 response",
      fn: async () => {
        const previousFetch = globalThis.fetch
        const previousBaseUrl = Deno.env.get("NEXT_PUBLIC_API_BASE_URL")
        setupFetchMock(new Response("Unauthorized", { status: 401 }))
        try {
          Deno.env.set("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8000")

          await assertRejects(() =>
            login({ user_id: "alice", password: "bad-password" })
          )
        } finally {
          restoreEnv("NEXT_PUBLIC_API_BASE_URL", previousBaseUrl)
          globalThis.fetch = previousFetch
        }
      },
    },
    {
      name: "returns current user when session is valid",
      fn: async () => {
        const previousFetch = globalThis.fetch
        const previousBaseUrl = Deno.env.get("NEXT_PUBLIC_API_BASE_URL")
        const responseBody = { user: { id: "alice", name: "Alice" } }
        const calls = setupFetchMock(
          new Response(JSON.stringify(responseBody), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        )
        try {
          Deno.env.set("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8000")

          const result = await getCurrentUser()

          assertEquals(result, responseBody)
          assertEquals(calls[0], {
            input: "http://localhost:8000/me",
            init: {
              method: "GET",
              credentials: "include",
            },
          })
        } finally {
          restoreEnv("NEXT_PUBLIC_API_BASE_URL", previousBaseUrl)
          globalThis.fetch = previousFetch
        }
      },
    },
    {
      name: "returns null when session is missing",
      fn: async () => {
        const previousFetch = globalThis.fetch
        const previousBaseUrl = Deno.env.get("NEXT_PUBLIC_API_BASE_URL")
        setupFetchMock(new Response("", { status: 401 }))
        try {
          Deno.env.set("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8000")

          const result = await getCurrentUser()

          assertEquals(result, null)
        } finally {
          restoreEnv("NEXT_PUBLIC_API_BASE_URL", previousBaseUrl)
          globalThis.fetch = previousFetch
        }
      },
    },
    {
      name: "throws when /me returns unexpected status",
      fn: async () => {
        const previousFetch = globalThis.fetch
        const previousBaseUrl = Deno.env.get("NEXT_PUBLIC_API_BASE_URL")
        setupFetchMock(new Response("Server error", { status: 500 }))
        try {
          Deno.env.set("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8000")

          await assertRejects(() => getCurrentUser())
        } finally {
          restoreEnv("NEXT_PUBLIC_API_BASE_URL", previousBaseUrl)
          globalThis.fetch = previousFetch
        }
      },
    },
    {
      name: "fetches nikki list with pagination",
      fn: async () => {
        const previousFetch = globalThis.fetch
        const previousBaseUrl = Deno.env.get("NEXT_PUBLIC_API_BASE_URL")
        const responseBody = {
          items: [
            { id: 1, content: "Hello", date: "2024-01-01T00:00:00.000Z", tags: ["work"] },
          ],
        }
        const calls = setupFetchMock(
          new Response(JSON.stringify(responseBody), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        )
        try {
          Deno.env.set("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8000")

          const result = await fetchNikkis({ limit: 10, offset: 5 })

          assertEquals(result, responseBody)
          assertEquals(calls[0], {
            input: "http://localhost:8000/nikki?limit=10&offset=5",
            init: {
              method: "GET",
              credentials: "include",
            },
          })
        } finally {
          restoreEnv("NEXT_PUBLIC_API_BASE_URL", previousBaseUrl)
          globalThis.fetch = previousFetch
        }
      },
    },
    {
      name: "throws on nikki fetch failure",
      fn: async () => {
        const previousFetch = globalThis.fetch
        const previousBaseUrl = Deno.env.get("NEXT_PUBLIC_API_BASE_URL")
        setupFetchMock(new Response("Unauthorized", { status: 401 }))
        try {
          Deno.env.set("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8000")

          await assertRejects(() => fetchNikkis())
        } finally {
          restoreEnv("NEXT_PUBLIC_API_BASE_URL", previousBaseUrl)
          globalThis.fetch = previousFetch
        }
      },
    },
    {
      name: "logs out current session",
      fn: async () => {
        const previousFetch = globalThis.fetch
        const previousBaseUrl = Deno.env.get("NEXT_PUBLIC_API_BASE_URL")
        const calls = setupFetchMock(
          new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        )
        try {
          Deno.env.set("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8000")

          const result = await logout()

          assertEquals(result, { success: true })
          assertEquals(calls[0], {
            input: "http://localhost:8000/logout",
            init: {
              method: "POST",
              credentials: "include",
            },
          })
        } finally {
          restoreEnv("NEXT_PUBLIC_API_BASE_URL", previousBaseUrl)
          globalThis.fetch = previousFetch
        }
      },
    },
    {
      name: "throws when logout fails",
      fn: async () => {
        const previousFetch = globalThis.fetch
        const previousBaseUrl = Deno.env.get("NEXT_PUBLIC_API_BASE_URL")
        setupFetchMock(new Response("Server error", { status: 500 }))
        try {
          Deno.env.set("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8000")

          await assertRejects(() => logout())
        } finally {
          restoreEnv("NEXT_PUBLIC_API_BASE_URL", previousBaseUrl)
          globalThis.fetch = previousFetch
        }
      },
    },
  ],
}
