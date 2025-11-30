import Prisma from "npm:@prisma/client"
import type { Nikki } from "../../core/src/domain/nikki.ts"
import type { NikkiRepository as INikkiRepository } from "../../core/src/repositories/NikkiRepository.ts"

const { PrismaClient, Prisma: PrismaNS } = Prisma

const normalizeFileUrl = (target: URL) => {
  let pathname = target.pathname
  if (pathname[0] === "/" && pathname[2] === ":") {
    pathname = pathname.slice(1)
  }
  return `file:${pathname}`
}

const getDatabaseUrl = (override?: string) => {
  if (override) return override

  // deno-lint-ignore no-explicit-any
  const deno = (globalThis as any).Deno as typeof Deno | undefined
  const denoUrl = deno?.env?.get("DATABASE_URL")
  if (denoUrl) return denoUrl

  // deno-lint-ignore no-explicit-any
  const nodeProcess = (globalThis as any).process as
    | { env?: Record<string, string | undefined> }
    | undefined
  const nodeUrl = nodeProcess?.env?.DATABASE_URL
  if (nodeUrl) return nodeUrl

  const defaultPath = new URL("../prisma/dev.db", import.meta.url)
  return normalizeFileUrl(defaultPath)
}

export class NikkiRepository implements INikkiRepository {
  private readonly prisma: Prisma.PrismaClient

  constructor(
    prismaClient?: Prisma.PrismaClient,
    databaseUrl?: string,
  ) {
    const dbUrl = getDatabaseUrl(databaseUrl)
    this.prisma =
      prismaClient ??
      new PrismaClient({
        datasources: { db: { url: dbUrl } },
      })
  }

  async findByUser(
    userId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<Nikki[]> {
    const limit = options?.limit ?? 50
    const offset = options?.offset ?? 0

    const nikkiRows = await this.prisma.$queryRaw<
      Array<{
        id: number
        content: string
        date: Date | string
        userId: string
      }>
    >(PrismaNS.sql`
      SELECT
        n.id,
        n.content,
        n.date,
        n.userId
      FROM Nikki n
      WHERE n.userId = ${userId}
      ORDER BY n.date DESC, n.id DESC
      LIMIT ${limit} OFFSET ${offset}
    `)

    const ids = nikkiRows.map((row) => row.id)
    let tagRows: Array<{ nikkiId: number; tag: string }> = []
    if (ids.length > 0) {
      tagRows = await this.prisma.$queryRaw<
        Array<{ nikkiId: number; tag: string }>
      >(PrismaNS.sql`
        SELECT nt.A as nikkiId, t.name as tag
        FROM _NikkiToTag nt
        JOIN Tag t ON t.id = nt.B
        WHERE nt.A IN (${PrismaNS.join(ids)})
      `)
    }

    const grouped = new Map<number, Nikki>()

    for (const row of nikkiRows) {
      const date = row.date instanceof Date ? row.date : new Date(row.date)

      if (!grouped.has(row.id)) {
        grouped.set(row.id, {
          id: row.id,
          content: row.content,
          date,
          tags: tagRows
            .filter((tagRow) => tagRow.nikkiId === row.id)
            .map((tagRow) => tagRow.tag),
          userId: row.userId,
        })
      }
    }

    const items = Array.from(grouped.values())
    for (const item of items) {
      item.tags.sort()
    }
    return items
  }
}
