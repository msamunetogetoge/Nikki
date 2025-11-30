import { assertEquals } from "jsr:@std/assert"
import Prisma from "npm:@prisma/client"
import type { TestSuite } from "../../../scripts/deno_test_runner.ts"
import { UserRepository } from "../../../packages/db/src/UserRepository.ts"

const { PrismaClient } = Prisma

const createTestPrisma = async (dbPath: string) => {
  const prisma = new PrismaClient({
    datasources: { db: { url: `file:${dbPath}` } },
  })

  await prisma.$executeRawUnsafe(
    'CREATE TABLE IF NOT EXISTS "User" ("id" TEXT PRIMARY KEY, "password" TEXT NOT NULL, "name" TEXT NOT NULL);',
  )

  return prisma
}

export const userRepositorySuite: TestSuite = {
  name: "UserRepository",
  tests: [
    {
      name: "finds users by id",
      fn: async () => {
        const tmpDir = await Deno.makeTempDir()
        const prisma = await createTestPrisma(`${tmpDir}/test.db`)
        try {
          await prisma.user.create({
            data: { id: "alice", name: "Alice", password: "secret" },
          })

          const repository = new UserRepository(prisma)

          const found = await repository.findById("alice")
          const missing = await repository.findById("bob")

          assertEquals(found, { id: "alice", name: "Alice", password: "secret" })
          assertEquals(missing, null)
        } finally {
          await prisma.$disconnect()
          await Deno.remove(tmpDir, { recursive: true })
        }
      },
    },
  ],
}
