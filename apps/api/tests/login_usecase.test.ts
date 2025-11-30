import { assertEquals, assertRejects } from "jsr:@std/assert"
import type { TestSuite } from "../../../scripts/deno_test_runner.ts"
import type { User } from "../../../packages/core/src/domain/user.ts"
import type { UserRepository } from "../../../packages/core/src/repositories/UserRepository.ts"
import type { CryptoService } from "../../../packages/core/src/services/CryptoService.ts"
import { LoginUseCase } from "../../../packages/core/src/usecase/LoginUseCase.ts"

class InMemoryUserRepository implements UserRepository {
  constructor(private readonly users: Record<string, User>) {}

  async findById(id: string): Promise<User | null> {
    return this.users[id] ?? null
  }
}

const createCryptoStub = (prefix: string): CryptoService =>
  ({
    encrypt: async (value: string) => `${prefix}:${value}`,
    decrypt: async (value: string) => value.replace(`${prefix}:`, ""),
  }) as CryptoService

export const loginUseCaseSuite: TestSuite = {
  name: "LoginUseCase",
  tests: [
    {
      name: "returns user when credentials are valid",
      fn: async () => {
        const cryptoStub = createCryptoStub("enc")
        const users: Record<string, User> = {
          alice: { id: "alice", name: "Alice", password: "enc:password123" },
        }
        const repository = new InMemoryUserRepository(users)
        const useCase = new LoginUseCase(repository, cryptoStub)

        const result = await useCase.execute("alice", "password123")

        assertEquals(result, { id: "alice", name: "Alice" })
      },
    },
    {
      name: "rejects when user is missing",
      fn: async () => {
        const cryptoStub = createCryptoStub("enc")
        const repository = new InMemoryUserRepository({})
        const useCase = new LoginUseCase(repository, cryptoStub)

        await assertRejects(
          () => useCase.execute("missing-user", "password123"),
          Error,
          "Invalid credentials",
        )
      },
    },
    {
      name: "rejects when password does not match",
      fn: async () => {
        const cryptoStub = createCryptoStub("enc")
        const users: Record<string, User> = {
          alice: { id: "alice", name: "Alice", password: "enc:password123" },
        }
        const repository = new InMemoryUserRepository(users)
        const useCase = new LoginUseCase(repository, cryptoStub)

        await assertRejects(
          () => useCase.execute("alice", "wrong"),
          Error,
          "Invalid credentials",
        )
      },
    },
  ],
}
