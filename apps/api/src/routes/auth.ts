import type { Hono } from "hono"
import { setCookie } from "hono/cookie"
import type { LoginRequestBody, LoginResponse } from "../../../../packages/core/src/api/login.ts"
import { InvalidCredentialsError } from "../../../../packages/core/src/usecase/LoginUseCase.ts"
import type { LoginUseCasePort } from "../types.ts"

export function registerAuthRoutes(
  app: Hono,
  { loginUseCase }: { loginUseCase: LoginUseCasePort },
) {
  app.post("/login", async (c) => {
    let body: LoginRequestBody | null = null

    try {
      body = await c.req.json<LoginRequestBody>()
    } catch {
      return c.json({ success: false, error: "Invalid JSON" }, 400)
    }

    if (!body?.user_id || !body.password) {
      return c.json({ success: false, error: "Invalid payload" }, 400)
    }

    try {
      const user = await loginUseCase.execute(body.user_id, body.password)
      const response: LoginResponse = { success: true, user }

      setCookie(c, "session", user.id, {
        httpOnly: true,
        path: "/",
      })

      return c.json(response, 200)
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        return c.json({ success: false }, 401)
      }

      console.error("Unexpected login error", error)
      return c.json({ success: false }, 500)
    }
  })

  return app
}
