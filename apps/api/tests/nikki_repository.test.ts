import { assertEquals } from "jsr:@std/assert"
import Prisma from "npm:@prisma/client"
import type { TestSuite } from "../../../scripts/deno_test_runner.ts"
import { NikkiRepository } from "../../../packages/db/src/NikkiRepository.ts"

const { PrismaClient, Prisma: PrismaNS } = Prisma

const createTestPrisma = async (dbPath: string) => {
  const prisma = new PrismaClient({
    datasources: { db: { url: `file:${dbPath}` } },
  })

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

  return prisma
}

export const nikkiRepositorySuite: TestSuite = {
  name: "NikkiRepository",
  tests: [
    {
      name: "finds nikki entries for a user with tags and pagination",
      fn: async () => {
        const tmpDir = await Deno.makeTempDir()
        const prisma = await createTestPrisma(`${tmpDir}/test.db`)

        try {
          const userId = "demo_user"
          await prisma.user.create({
            data: { id: userId, name: "Demo", password: "secret" },
          })
          const travel = await prisma.$queryRaw<{ id: number }[]>(
            PrismaNS.sql`INSERT INTO "Tag" ("name") VALUES ('travel') RETURNING id`,
          )
          const work = await prisma.$queryRaw<{ id: number }[]>(
            PrismaNS.sql`INSERT INTO "Tag" ("name") VALUES ('work') RETURNING id`,
          )

          const first = await prisma.$queryRaw<{ id: number }[]>(
            PrismaNS.sql`
              INSERT INTO "Nikki" ("content", "date", "userId")
              VALUES ('First entry', ${new Date("2024-01-01T00:00:00.000Z")}, ${userId})
              RETURNING id
            `,
          )
          await prisma.$executeRaw(
            PrismaNS.sql`INSERT OR IGNORE INTO "_NikkiToTag" ("A", "B") VALUES (${first[0].id}, ${travel[0].id})`,
          )

          const second = await prisma.$queryRaw<{ id: number }[]>(
            PrismaNS.sql`
              INSERT INTO "Nikki" ("content", "date", "userId")
              VALUES ('Second entry', ${new Date("2024-01-02T00:00:00.000Z")}, ${userId})
              RETURNING id
            `,
          )
          await prisma.$executeRaw(
            PrismaNS.sql`INSERT OR IGNORE INTO "_NikkiToTag" ("A", "B") VALUES (${second[0].id}, ${work[0].id})`,
          )

          const third = await prisma.$queryRaw<{ id: number }[]>(
            PrismaNS.sql`
              INSERT INTO "Nikki" ("content", "date", "userId")
              VALUES ('Third entry', ${new Date("2024-01-03T00:00:00.000Z")}, ${userId})
              RETURNING id
            `,
          )
          await prisma.$executeRaw(
            PrismaNS.sql`INSERT OR IGNORE INTO "_NikkiToTag" ("A", "B") VALUES (${third[0].id}, ${travel[0].id})`,
          )
          await prisma.$executeRaw(
            PrismaNS.sql`INSERT OR IGNORE INTO "_NikkiToTag" ("A", "B") VALUES (${third[0].id}, ${work[0].id})`,
          )

          const repository = new NikkiRepository(prisma)

          const firstPage = await repository.findByUser(userId, { limit: 2, offset: 0 })
          const secondPage = await repository.findByUser(userId, { limit: 2, offset: 2 })
          const otherUser = await repository.findByUser("missing", {})

          assertEquals(firstPage.length, 2)
          assertEquals(firstPage[0], {
            id: 3,
            content: "Third entry",
            date: new Date("2024-01-03T00:00:00.000Z"),
            tags: ["travel", "work"],
            userId,
          })
          assertEquals(firstPage[1], {
            id: 2,
            content: "Second entry",
            date: new Date("2024-01-02T00:00:00.000Z"),
            tags: ["work"],
            userId,
          })
          assertEquals(secondPage, [
            {
              id: 1,
              content: "First entry",
              date: new Date("2024-01-01T00:00:00.000Z"),
              tags: ["travel"],
              userId,
            },
          ])
          assertEquals(otherUser, [])
        } finally {
          await prisma.$disconnect()
          await Deno.remove(tmpDir, { recursive: true })
        }
      },
    },
  ],
}
