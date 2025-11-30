import { assertEquals } from "jsr:@std/assert"
import type { TestSuite } from "../../../scripts/deno_test_runner.ts"
import type { User } from "../../../packages/core/src/domain/user.ts"
import type { UserRepository } from "../../../packages/core/src/repositories/UserRepository.ts"
import { AuthUseCase } from "../../../packages/core/src/usecase/AuthUseCase.ts"

class InMemoryUserRepository implements UserRepository {
  constructor(private readonly users: Record<string, User>) {}

  async findById(id: string): Promise<User | null> {
    return this.users[id] ?? null
  }
}

export const authUseCaseSuite: TestSuite = {
  name: "AuthUseCase",
  tests: [
    {
      name: "returns current user when session id is valid",
      fn: async () => {
        const repository = new InMemoryUserRepository({
          alice: { id: "alice", name: "Alice", password: "secret" },
        })
        const useCase = new AuthUseCase(repository)

        const currentUser = await useCase.getCurrentUser("alice")

        assertEquals(currentUser, { id: "alice", name: "Alice" })
      },
    },
    {
      name: "returns null when session is missing or invalid",
      fn: async () => {
        const repository = new InMemoryUserRepository({})
        const useCase = new AuthUseCase(repository)

        const missingSession = await useCase.getCurrentUser("")
        const missingUser = await useCase.getCurrentUser("bob")

        assertEquals(missingSession, null)
        assertEquals(missingUser, null)
      },
    },
  ],
}
