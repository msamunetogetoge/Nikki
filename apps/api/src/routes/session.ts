import type { Hono } from "hono"
import { getCookie, setCookie } from "hono/cookie"
import type { AuthUseCasePort } from "../types.ts"

export function registerSessionRoutes(
  app: Hono,
  { authUseCase }: { authUseCase: AuthUseCasePort },
) {
  app.get("/me", async (c) => {
    const sessionId = getCookie(c, "session")
    const user = await authUseCase.getCurrentUser(sessionId)

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401)
    }

    return c.json({ user })
  })

  app.post("/logout", (c) => {
    setCookie(c, "session", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
    })

    return c.json({ success: true })
  })

  return app
}
