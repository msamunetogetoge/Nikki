import Prisma from "npm:@prisma/client"
import type { UserRepository as IUserRepository } from "../../core/src/repositories/UserRepository.ts"
import type { User } from "../../core/src/domain/user.ts"

const { PrismaClient } = Prisma
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

export class UserRepository implements IUserRepository {
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

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id } })
    if (!record) return null

    const { id: userId, name, password } = record
    return { id: userId, name, password }
  }
}
