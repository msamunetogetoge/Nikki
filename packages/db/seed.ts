/// <reference lib="deno.ns" />
import Prisma from "npm:@prisma/client"
import { CryptoService } from "../core/src/services/CryptoService.ts"

const { PrismaClient, Prisma: PrismaNS } = Prisma

const normalizeFileUrl = (target: URL) => {
  let pathname = target.pathname
  if (pathname[0] === "/" && pathname[2] === ":") {
    pathname = pathname.slice(1)
  }
  return `file:${pathname}`
}

const getDatabaseUrl = () => {
  const envUrl = Deno.env.get("DATABASE_URL")
  if (envUrl) return envUrl

  return normalizeFileUrl(new URL("./prisma/dev.db", import.meta.url))
}

const prisma = new PrismaClient({
  datasources: { db: { url: getDatabaseUrl() } },
})

const ensureSchema = async () => {
  await prisma.$executeRawUnsafe(
    'CREATE TABLE IF NOT EXISTS "User" ("id" TEXT PRIMARY KEY, "password" TEXT NOT NULL, "name" TEXT NOT NULL);',
  )
  await prisma.$executeRawUnsafe(
    'CREATE TABLE IF NOT EXISTS "Tag" ("id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "name" TEXT NOT NULL UNIQUE);',
  )
  await prisma.$executeRawUnsafe(
    'CREATE TABLE IF NOT EXISTS "Nikki" ("id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "content" TEXT NOT NULL, "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "userId" TEXT NOT NULL, CONSTRAINT "Nikki_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE);',
  )
  await prisma.$executeRawUnsafe(
    'CREATE TABLE IF NOT EXISTS "_NikkiToTag" ("A" INTEGER NOT NULL, "B" INTEGER NOT NULL, CONSTRAINT "_NikkiToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Nikki" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "_NikkiToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE);',
  )
  await prisma.$executeRawUnsafe(
    'CREATE UNIQUE INDEX IF NOT EXISTS "_NikkiToTag_AB_unique" ON "_NikkiToTag"("A", "B");',
  )
  await prisma.$executeRawUnsafe(
    'CREATE INDEX IF NOT EXISTS "_NikkiToTag_B_index" ON "_NikkiToTag"("B");',
  )
}

const upsertUser = async () => {
  const secret = Deno.env.get("AUTH_SECRET") ?? "dev-secret"
  const crypto = new CryptoService(secret)
  const encryptedPassword = await crypto.encrypt("password123")

  await prisma.user.upsert({
    where: { id: "demo_user" },
    update: { name: "Demo User", password: encryptedPassword },
    create: { id: "demo_user", name: "Demo User", password: encryptedPassword },
  })
}

const upsertTags = async (names: string[]) => {
  const tagIds = new Map<string, number>()

  for (const name of names) {
    await prisma.$executeRaw(
      PrismaNS.sql`INSERT INTO "Tag" ("name") VALUES (${name}) ON CONFLICT("name") DO NOTHING`,
    )
    const rows = await prisma.$queryRaw<
      { id: number }[]
    >(PrismaNS.sql`SELECT id FROM "Tag" WHERE name = ${name}`)
    if (rows[0]?.id) {
      tagIds.set(name, rows[0].id)
    }
  }

  return tagIds
}

const seedNikkis = async (userId: string, tagIds: Map<string, number>) => {
  const entries = [
    {
      content: "Launched the new dashboard. Feeling proud of the team!",
      date: new Date("2024-11-01T10:00:00.000Z"),
      tags: ["work"],
    },
    {
      content: "Morning run by the river. Clear skies and cold air.",
      date: new Date("2024-11-02T07:15:00.000Z"),
      tags: ["life", "health"],
    },
    {
      content: "Read a chapter about event-driven architectures.",
      date: new Date("2024-11-03T21:00:00.000Z"),
      tags: ["learning", "work"],
    },
    {
      content: "Cooked ramen with new toppings. Turned out great.",
      date: new Date("2024-11-04T18:30:00.000Z"),
      tags: ["life"],
    },
    {
      content: "Booked flights for the winter trip to Hokkaido.",
      date: new Date("2024-11-05T12:00:00.000Z"),
      tags: ["travel", "life"],
    },
  ]

  for (const entry of entries) {
    const inserted = await prisma.$queryRaw<
      { id: number }[]
    >(PrismaNS.sql`
      INSERT INTO "Nikki" ("content", "date", "userId")
      VALUES (${entry.content}, ${entry.date}, ${userId})
      RETURNING id
    `)

    const nikkiId = inserted[0]?.id
    if (!nikkiId) continue

    for (const tagName of entry.tags) {
      const tagId = tagIds.get(tagName)
      if (!tagId) continue
      await prisma.$executeRaw(
        PrismaNS.sql`
          INSERT OR IGNORE INTO "_NikkiToTag" ("A", "B")
          VALUES (${nikkiId}, ${tagId})
        `,
      )
    }
  }
}

const seed = async () => {
  await ensureSchema()
  await upsertUser()

  const tagIds = await upsertTags(["work", "life", "travel", "learning", "health"])
  await seedNikkis("demo_user", tagIds)

  console.log("Seeded demo_user / password123 with nikki entries")
}

seed()
  .catch((error) => {
    console.error("Failed to seed database", error)
    Deno.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
