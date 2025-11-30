import type { Hono } from "hono"
import { getCookie } from "hono/cookie"
import type { AuthUseCasePort, GetNikkiListUseCasePort } from "../types.ts"

const parseNumber = (value: string | null): number | undefined => {
  if (!value) return undefined
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? undefined : parsed
}

export function registerNikkiRoutes(
  app: Hono,
  {
    authUseCase,
    getNikkiListUseCase,
  }: { authUseCase: AuthUseCasePort; getNikkiListUseCase: GetNikkiListUseCasePort },
) {
  app.get("/nikki", async (c) => {
    const sessionId = getCookie(c, "session")
    const user = await authUseCase.getCurrentUser(sessionId)

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401)
    }

    const url = new URL(c.req.url)
    const limit = parseNumber(url.searchParams.get("limit"))
    const offset = parseNumber(url.searchParams.get("offset"))

    const { items } = await getNikkiListUseCase.execute(user.id, { limit, offset })
    const responseItems = items.map((item) => ({
      id: item.id,
      content: item.content,
      date: item.date.toISOString(),
      tags: item.tags,
    }))

    return c.json({ items: responseItems })
  })

  return app
}
