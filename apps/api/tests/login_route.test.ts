import { assertEquals, assertExists } from "jsr:@std/assert"
import type { TestSuite } from "../../../scripts/deno_test_runner.ts"
import { createApp } from "../src/app.ts"
import { InvalidCredentialsError } from "../../../packages/core/src/usecase/LoginUseCase.ts"

type LoginUseCase = {
  execute(userId: string, password: string): Promise<{ id: string; name: string }>
}

const jsonHeaders = { "content-type": "application/json" }

export const loginRouteSuite: TestSuite = {
  name: "Login route",
  tests: [
    {
      name: "returns 200 with user and cookie on success",
      fn: async () => {
        const loginUseCase: LoginUseCase = {
          execute: async () => ({ id: "alice", name: "Alice" }),
        }
        const app = createApp({ loginUseCase })

        const res = await app.request("/login", {
          method: "POST",
          headers: jsonHeaders,
          body: JSON.stringify({ user_id: "alice", password: "password123" }),
        })

        assertEquals(res.status, 200)
        assertEquals(await res.json(), {
          success: true,
          user: { id: "alice", name: "Alice" },
        })
        assertExists(res.headers.get("set-cookie"))
      },
    },
    {
      name: "returns 400 when request body is invalid",
      fn: async () => {
        const loginUseCase: LoginUseCase = {
          execute: async () => ({ id: "alice", name: "Alice" }),
        }
        const app = createApp({ loginUseCase })

        const res = await app.request("/login", {
          method: "POST",
          headers: jsonHeaders,
          body: JSON.stringify({ user_id: "alice" }),
        })

        assertEquals(res.status, 400)
      },
    },
    {
      name: "returns 401 when credentials are invalid",
      fn: async () => {
        const loginUseCase: LoginUseCase = {
          execute: async () => {
            throw new InvalidCredentialsError()
          },
        }
        const app = createApp({ loginUseCase })

        const res = await app.request("/login", {
          method: "POST",
          headers: jsonHeaders,
          body: JSON.stringify({ user_id: "alice", password: "wrong" }),
        })

        assertEquals(res.status, 401)
      },
    },
  ],
}
