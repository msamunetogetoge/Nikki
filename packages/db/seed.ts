/// <reference lib="deno.ns" />
import Prisma from "npm:@prisma/client"
import { CryptoService } from "../core/src/services/CryptoService.ts"

const { PrismaClient } = Prisma

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

const seed = async () => {
  await prisma.$executeRawUnsafe(
    'CREATE TABLE IF NOT EXISTS "User" ("id" TEXT PRIMARY KEY, "password" TEXT NOT NULL, "name" TEXT NOT NULL)',
  )

  const secret = Deno.env.get("AUTH_SECRET") ?? "dev-secret"
  const crypto = new CryptoService(secret)
  const encryptedPassword = await crypto.encrypt("password123")

  await prisma.user.upsert({
    where: { id: "demo_user" },
    update: { name: "Demo User", password: encryptedPassword },
    create: { id: "demo_user", name: "Demo User", password: encryptedPassword },
  })

  console.log("Seeded demo_user / password123")
}

seed()
  .catch((error) => {
    console.error("Failed to seed database", error)
    Deno.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
