/// <reference lib="deno.ns" />
import { assertEquals, assertRejects } from "jsr:@std/assert"
import type { TestSuite } from "../../../scripts/deno_test_runner.ts"
import { login } from "./api.ts"

const setupFetchMock = (response: Response) => {
  const calls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = []
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ input, init })
    return response
  }
  return calls
}

export const loginApiSuite: TestSuite = {
  name: "Frontend login API client",
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
          if (previousBaseUrl === undefined) {
            Deno.env.delete("NEXT_PUBLIC_API_BASE_URL")
          } else {
            Deno.env.set("NEXT_PUBLIC_API_BASE_URL", previousBaseUrl)
          }
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
          if (previousBaseUrl === undefined) {
            Deno.env.delete("NEXT_PUBLIC_API_BASE_URL")
          } else {
            Deno.env.set("NEXT_PUBLIC_API_BASE_URL", previousBaseUrl)
          }
          globalThis.fetch = previousFetch
        }
      },
    },
  ],
}
